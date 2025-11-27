import jwt from 'jsonwebtoken';
import { WebSocket, WebSocketServer, type RawData } from "ws";
import { Game, GameState, PlayerController } from "../common/models/game.ts";
import { CommandType, MessageType, type Chat, type ChoosePiece, type Command, type FullSync, type Message } from "../common/models/message.ts";
import type { JwtPayload } from "../common/models/model.ts";
import path from 'path';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { incrementPoints, saveVideo } from './database.ts';
import fs from 'fs'

/**
 * Associar o nome de usuário ao socket
 */
interface GameSocket extends WebSocket {
    peerId?: string
    username?: string
}

/**
 * Inicialização do gerenciador
 */
interface ManagerInit {
    nextId: number,
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
    recordings = new Map<string, ChildProcessWithoutNullStreams>();
    turnTimer: NodeJS.Timeout | null = null

    constructor({ nextId, port }: ManagerInit) {
        this.game = new Game();
        this.game.id = nextId + 1

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

                    this.handleStopRecording(ws.username)
                }

                if (ws.peerId) {
                    const players = this.game.players
                        .filter(p => p.controller === PlayerController.HUMAN)
                    const peerIds = players
                        .map(p => this.sockets.get(p.username)?.peerId)
                        .filter(p => p !== undefined)

                    console.log(peerIds)

                    this.broadcast({
                        type: MessageType.VIDEO_SYNC,
                        content: peerIds
                    } as Message)
                }
            })

            ws.on('message', async (data, isBinary) => {
                if (isBinary && ws.username !== undefined) {
                    this.handleRecordingPacket(ws.username, data)
                    return
                }

                const messageString = data.toString();
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

    private async handleMessage(ws: GameSocket, message: Message, username: string) {
        switch (message.type) {
            case MessageType.GREET:
                this.handleGreet(username)
                break
            case MessageType.CHAT:
                this.handleChat(message.content as Chat, username)
                break
            case MessageType.FILL_BOTS:
                this.handleFillBots(username)
                break
            case MessageType.COMMAND:
                await this.handleCommand(ws, message.content as Command, username)
                break
            case MessageType.VIDEO_READY:
                this.handleConnectVideo(ws, message.content as string, username)
                break;
            case MessageType.START_RECORDING:
                this.handleStartRecording(username)
                break
            case MessageType.STOP_RECORDING:
                this.handleStopRecording(username)
                break
        }
    }

    private handleStartRecording(username: string) {
        // Criar diretório se não existe
        if (!fs.existsSync('public/uploads')) {
            fs.mkdirSync('public/uploads')
        }

        // Iniciar FFMPEG
        const filePath = path.join('uploads', `${username}_${this.game.id}_${Date.now()}.webm`)
        const ffmpeg = spawn('ffmpeg', [
            '-y',
            '-f', 'webm',
            '-i', 'pipe:0',
            '-c', 'copy',
            // Evitar problema com timestamp dos quadros
            '-fflags', '+genpts',
            '-avoid_negative_ts', 'make_zero',
            path.join('public', filePath)
        ]);
        console.log(`[server] iniciando gravação em ${filePath}`)

        // Gerenciar erros no FFMPEG
        ffmpeg.stderr.on('data', (data) => {
            console.log(`[ffmpeg:${username}] ${data}`);
        });
        ffmpeg.on('close', (code) => {
            console.log(`[ffmpeg:${username}] ${code}`);
            if (code !== 0) {
                console.error(`[ffmpeg:${username}] ocorreu um erro`);
            }
        });
        ffmpeg.on('error', (err) => {
            console.error(`[ffmpeg ${username}] falha ao iniciar processo:`, err);
        });

        // Salva o caminho da gravação no BD
        saveVideo(username, this.game.id, filePath)

        // Salva o processo da gravação no mapping
        this.recordings.set(username, ffmpeg)
    }

    private handleStopRecording(username: string) {
        const ffmpeg = this.recordings.get(username)
        if (ffmpeg) {
            ffmpeg.stdin.end()
            console.log(`[server] gravação finalizada por ${username}`)
            this.recordings.delete(username)
        }
    }

    private handleRecordingPacket(username: string, data: RawData) {
        const ffmpeg = this.recordings.get(username)
        if (ffmpeg && ffmpeg.stdin.writable) {
            const chunk = Buffer.from(data as any)

            if (chunk.length < 100) {
                console.warn("[server] PACOTE SUSPEITO, IGNORANDO...")
                return
            }

            try {
                ffmpeg.stdin.write(chunk, (err) => {
                    if (err) {
                        console.error(`[server] erro de escrita no pipe do ffmpeg (${username})`)
                        this.handleStopRecording(username)
                    }
                })
            } catch (error) {
                console.error(`[server] erro ao escrever chunk (${username})`)
            }
        } else {
            console.warn(`[server] tentativa de enviar pacote de vídeo a um processo fechado (${username})`)
        }
    }

    private handleConnectVideo(socket: GameSocket, peerId: string, username: string) {
        const players = this.game.players.filter(p => p.controller === PlayerController.HUMAN)
        const isUserPlayer = players.find(p => p.username === username) !== undefined

        if (isUserPlayer) {
            socket.peerId = peerId

            const peerIds = players
                .map(p => this.sockets.get(p.username)?.peerId)
                .filter(p => p !== undefined)

            this.broadcastPlayers({
                type: MessageType.VIDEO_SYNC,
                content: peerIds
            })
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

    private async handleCommand(ws: GameSocket, command: Command, username: string) {
        switch (command.command) {
            case CommandType.ROLL_DICE:
                if (this.game.state !== GameState.DICE || this.game.currentPlayer?.username !== username) return;
                this.stopTurnTimer()

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

                this.stopTurnTimer()
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
                // Entrar durante o andamento da partida
                if (this.game.state !== GameState.LOBBY) {
                    const botPlayer = this.game.players.find(p => p.controller === PlayerController.AI);
                    if (botPlayer) {
                        botPlayer.controller = PlayerController.HUMAN;
                        botPlayer.username = username;

                        this.spectators = this.spectators.filter(s => s !== username);
                        this.sockets.set(username, ws);

                        this.broadcast(this.createFullSyncMessage());

                        if (this.game.currentPlayer === botPlayer) {
                            this.startTurnTimer();
                        }
                        return;
                    }
                }

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
            this.stopTurnTimer()
            this.broadcastState()

            await delay(2500)

            this.game.players.forEach(p => {
                if (p.controller === PlayerController.HUMAN) {
                    if (!this.spectators.includes(p.username)) {
                        this.spectators.push(p.username)
                    }
                }
            })

            let multiplier = 1
            
            for (const winner of this.game.winners) {
                if (winner.controller === PlayerController.HUMAN) {
                    await incrementPoints(winner.username, multiplier * 100)
                    multiplier /= 2
                }
            }

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
        } else {
            this.startTurnTimer()
        }
    }

    private startTurnTimer() {
        this.stopTurnTimer();
        const currentPlayer = this.game.currentPlayer;

        if (currentPlayer && currentPlayer.controller === PlayerController.HUMAN) {
            this.turnTimer = setTimeout(() => {
                this.handleInactivity(currentPlayer.username);
            }, 30000);
        }
    }

    private stopTurnTimer() {
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }
    }

    private handleInactivity(username: string) {
        const player = this.game.players.find(p => p.username === username);
        if (!player) return;

        this.spectators.push(username);

        // Tentar adicionar o próximo da fila
        const nextInQueue = this.queue.shift();

        if (nextInQueue) {
            player.username = nextInQueue;
            player.controller = PlayerController.HUMAN;
            const socket = this.sockets.get(nextInQueue);
            if (socket) this.startTurnTimer();
        } else {
            player.username = "BOT";
            player.controller = PlayerController.AI;
        }

        this.broadcast(this.createFullSyncMessage());

        if (player.controller === PlayerController.AI) {
            this.executeBotTurn();
        }
    }

    private async executeBotTurn() {
        console.log("Bot turn starting...");

        if (!this.game.currentPlayer || this.game.currentPlayer.controller !== PlayerController.AI) return;

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

    private broadcast(message: Message, except?: WebSocket) {
        const payload = JSON.stringify(message);
        this.server.clients.forEach(client => {
            if (except && client === except) {
                console.log("skipping...")
                return
            }


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
        let peerIds: string[] = []
        if (playersOnly) {
            const playerNames = this.game.players
                .filter(p => p.controller === PlayerController.HUMAN)
                .map(p => p.username)
            peerIds = playerNames
                .map(p => this.sockets.get(p)?.peerId)
                .filter(p => p !== undefined)
        }

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
                peers: playersOnly ? peerIds : [],
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
