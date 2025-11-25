import jwt from 'jsonwebtoken';
import { WebSocket, WebSocketServer } from "ws";
import { Game, GameState, PlayerController } from "../common/models/game.ts";
import { CommandType, MessageType, type Chat, type ChoosePiece, type Command, type FullSync, type Message } from "../common/models/message.ts";
import type { JwtPayload } from "../common/models/model.ts";

/**
 * Associar o nome de usuário ao socket
 */
interface GameSocket extends WebSocket {
    username?: string
}

/**
 * Inicialização do gerenciador
 */
interface ManagerInit {
    port: number
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Gerencia o estado do jogo com os clientes por meio de WebSockets
 */
class Manager {
    game: Game
    server: WebSocketServer;
    sockets = new Map<string, GameSocket>();
    globalChat: Chat[] = [];
    matchChat: Chat[] = [];
    queue: string[] = [];
    spectators: string[] = [];

    constructor({ port }: ManagerInit = { port: 3001 }) {
        this.game = new Game();
        this.server = new WebSocketServer({ port });
        console.log(`[server] Websocket rodando em ws://localhost:${port}`)

        this.server.on('connection', (ws: GameSocket) => {
            ws.send(JSON.stringify(this.createFullSyncMessage()));

            ws.on('close', () => {
                if (ws.username) {
                    const storedSocket = this.sockets.get(ws.username)

                    if (storedSocket === ws) {
                        this.sockets.delete(ws.username)
                    }
                }
            })

            ws.on('message', async (data, isBinary) => {
                const messageString = isBinary ? data : data.toString();
                let message: Message;

                try {
                    message = JSON.parse(messageString as string) as Message;
                } catch (e) {
                    return console.error("[error] Failed to parse message");
                }

                // Autenticação
                const user = this.authenticate(message.token, ws);
                if (!user) return;

                // Associar o socket a um usuário
                if (ws.username !== user.username) {
                    ws.username = user.username
                    this.sockets.set(user.username, ws)

                    const players = this.game.players.filter(p => p.controller !== PlayerController.AI).map(p => p.username);
                    const isPlayer = players.includes(user.username)

                    if (isPlayer) {
                        const payload = JSON.stringify(this.createFullSyncMessage(true));
                        ws.send(payload);
                    }
                }

                console.log(`[${message.type}] from ${user.username}`);

                // Processamento de mensagens
                await this.handleMessage(ws, message, user.username);
            });
        });
    }

    private authenticate(token: string | undefined, ws: WebSocket): { id: string, username: string } | null {
        if (!token) {
            console.log("[error] closed unauthenticated socket (no token)...");
            ws.close(3000, "Unauthenticated");
            return null;
        }

        try {
            const decoded = jwt.verify(token, "INE5646") as JwtPayload;
            return { id: decoded.id, username: decoded.username };
        } catch (error) {
            console.log("[error] closed socket with bad token...");
            ws.close(3000, "Unauthenticated");
            return null;
        }
    }

    private async handleMessage(ws: WebSocket, message: Message, username: string) {
        switch (message.type) {
            case MessageType.GREET:
                this.handleGreet(username);
                break;
            case MessageType.CHAT:
                this.handleChat(message.content as Chat, username);
                break;
            case MessageType.FILL_BOTS:
                this.handleFillBots(username);
                break;
            case MessageType.COMMAND:
                await this.handleCommand(message.content as Command, username);
                break;
        }
    }

    private handleGreet(username: string) {
        if (!this.spectators.includes(username) && !this.queue.includes(username)) {
            this.spectators.push(username);
            this.broadcast({
                type: MessageType.GREET,
                content: username
            });
        }
    }

    private handleChat(chat: Chat, username: string) {
        chat.author = username;

        if (!chat.global) {
            const players = this.game.players.filter(p => p.controller === PlayerController.HUMAN)

            if (players.find(p => p.username === username) !== undefined) {
                this.matchChat.push(chat)

                this.broadcastPlayers({
                    type: MessageType.CHAT,
                    content: chat
                })
            }
        } else {
            this.globalChat.push(chat);
            this.broadcast({
                type: MessageType.CHAT,
                content: chat
            });
        }
    }

    private handleFillBots(username: string) {
        if (this.game.state === GameState.LOBBY && this.queue.includes(username)) {
            console.log("Starting game with bots...");
            this.startGameWithBots();
        }
    }

    private async handleCommand(command: Command, username: string) {
        switch (command.command) {
            case CommandType.ROLL_DICE:
                if (this.game.state !== GameState.DICE || this.game.currentPlayer?.username !== username) return;

                this.game.dice = 0;
                this.broadcastState();

                this.game.rollDice();
                await delay(1000); // Delay para mostrar animação
                this.broadcastState();

                if (this.game.getRandomValidPiece() === undefined) {
                    await delay(1000); // Delay para tornar mais natural
                    this.game.nextRoll(); // Passar a vez
                    this.broadcastState();

                    await this.handleTurnCycle();
                }

                break;

            case CommandType.CHOOSE_PIECE:
                const data = command.data as ChoosePiece;
                const piece = this.game.board.pieces.find(p => p.id === data.id);

                if (!piece || !this.game.isPieceValidChoice(piece)) {
                    return;
                }

                this.game.choosePiece(piece);

                this.broadcast({
                    type: MessageType.CHOOSE_PIECE,
                    content: data
                });

                this.broadcastState();

                if (!await this.checkEnd()) {
                    await this.handleTurnCycle();
                }

                break;

            case CommandType.ENQUEUE:
                if (!this.queue.includes(username)) {
                    this.queue.push(username);
                    this.spectators = this.spectators.filter(n => n !== username);

                    this.broadcast({
                        type: MessageType.COMMAND,
                        content: { command: CommandType.ENQUEUE, data: username }
                    });

                    this.checkLobbyStart();
                }
                break;

            case CommandType.DEQUEUE:
                if (!this.spectators.includes(username)) {
                    this.spectators.push(username);
                    this.queue = this.queue.filter(n => n !== username);

                    this.broadcast({
                        type: MessageType.COMMAND,
                        content: { command: CommandType.DEQUEUE, data: username }
                    });
                }
                break;
        }
    }

    private async checkEnd() {
        const finished = this.game.checkEnd()

        if (finished) {
            this.broadcastState()

            await delay(2500)

            this.game.players.forEach(p => {
                if (p.controller === PlayerController.HUMAN) {
                    if (!this.spectators.includes(p.username)) {
                        this.spectators.push(p.username)
                    }
                }
            })
            this.game.reset()
            this.broadcast(this.createFullSyncMessage())

            return true
        }

        return false
    }

    private checkLobbyStart() {
        if (this.queue.length >= 4 && this.game.state === GameState.LOBBY) {
            console.log("Queue full, starting game...");
            this.startGame();
        }
    }

    private addFromQueue() {
        const player = this.queue.reverse().pop()
        this.queue.reverse()

        if (!player) {
            throw Error("Queue is empty")
        }

        this.game.addPlayer(player, PlayerController.HUMAN);
    }

    private addBot() {
        try {
            this.game.addPlayer("BOT", PlayerController.AI);
        } catch (error) {
            console.log("Could not add BOT: ", error)
        }
    }

    private startGameWithBots() {
        this.game.reset();

        console.log('queue length', this.queue.length)

        const playerCount = this.queue.length
        for (let i = 0; i < playerCount && i < 4; i++) {
            console.log("Add from queue once...")
            this.addFromQueue()
        }

        for (let i = playerCount; i < 4; i++) {
            this.addBot()
        }

        this.game.start();
        this.matchChat = [];
        this.broadcast(this.createFullSyncMessage())

        this.handleTurnCycle();
    }

    private startGame() {
        this.game.reset();

        const playerCount = this.queue.length
        for (let i = 0; i < playerCount && i < 4; i++) {
            this.addFromQueue()
        }

        this.game.start();
        this.broadcast(this.createFullSyncMessage());
    }

    private async handleTurnCycle() {
        if (this.game.state !== GameState.DICE && this.game.state !== GameState.PIECE) return;

        if (this.game.botTurn()) {
            await this.executeBotTurn();
        }
    }

    private async executeBotTurn() {
        console.log("Bot turn starting...");

        await delay(1000);
        this.game.dice = 0;
        this.broadcastState();

        this.game.rollDice();

        await delay(1000);
        this.broadcastState();

        const piece = this.game.getRandomValidPiece();
        await delay(1000);

        if (piece) {
            console.log(`Bot choosing piece ${piece.id}`);
            this.game.choosePiece(piece);

            this.broadcast({
                type: MessageType.CHOOSE_PIECE,
                content: { id: piece.id } as ChoosePiece
            });
            this.broadcastState();
        } else {
            console.log("Bot cannot move, skipping turn.");
            this.game.nextRoll(); // Passar a vez
            this.broadcastState();
        }

        if (!await this.checkEnd()) {
            await delay(500);
            await this.handleTurnCycle();
        }
    }

    private broadcast(message: Message) {
        const payload = JSON.stringify(message);
        this.server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }

    private broadcastState() {
        this.broadcast({
            type: MessageType.STATE_SYNC,
            content: this.game.asState()
        });
    }

    private broadcastPlayers(message: Message) {
        const payload = JSON.stringify(message)
        const players = this.game.players.filter(p => p.controller !== PlayerController.AI).map(p => p.username);
        const clients = this.sockets.keys().filter(user => players.includes(user))

        for (const client of clients) {
            const socket = this.sockets.get(client);
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(payload);
            }
        }
    }

    private createFullSyncMessage(playersOnly = false): Message {
        return {
            type: MessageType.FULL_SYNC,
            content: {
                state: {
                    currentPlayer: this.game.currentPlayer,
                    dice: this.game.dice,
                    state: this.game.state,
                },
                queue: this.queue,
                spectators: Array.from(this.spectators),
                players: this.game.players.map(player => ({
                    username: player.username,
                    color: player.color,
                    finished: player.finished,
                    controller: player.controller
                })),
                pieces: this.game.board.pieces.map(piece => ({
                    id: piece.id,
                    x: piece.tile?.x,
                    z: piece.tile?.z,
                    state: piece.state
                })),
                globalChat: this.globalChat,
                matchChat: playersOnly ? this.matchChat : [],
            } as FullSync
        };
    }
}

export { Manager };
