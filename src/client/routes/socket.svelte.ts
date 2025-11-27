import { choosePiece, game, setCurrentPlayer, setDice, setGameState, setResync, syncPlayers } from "$lib/game.svelte.ts";
import { get } from "svelte/store";
import { CommandType, MessageType, type Chat, type Command, type FullSync, type Message, type PieceSync, type StateSync } from "../../common/models/message.ts";
import { messages } from "./chat.svelte.ts";
import { players } from "$lib/game.svelte.ts";
import { clearAuth, tokenStore } from "$lib/auth.svelte.ts";
import { goto } from '$app/navigation';
import { video } from "./Webcam.svelte.ts";

let socket = $state<WebSocket | null>(null);

function connect() {
    if (socket) {
        socket.close()
    }

    socket = new WebSocket("ws://localhost:3001");

    socket.onopen = () => {
        console.log("Connected to ws://localhost:3001")

        if (socket === null) return;

        const token = get(tokenStore);

        socket.send(JSON.stringify({
            type: MessageType.GREET,
            token
        }))
    }

    socket.onclose = (event) => {
        if (event.code === 3000) {
            clearAuth()
            goto('/login')
        }
    }

    socket.onmessage = (event) => {
        const message: Message = JSON.parse(event.data);

        console.log(message);

        let content;

        switch (message.type) {
            case MessageType.GREET:
                const greetingUser = message.content as string;
                if (!players.spectators.includes(greetingUser)) {
                    players.spectators.push(greetingUser)
                    players.queue = players.queue.filter(n => n !== greetingUser)
                }
                break
            case MessageType.CHAT:
                const chat = message.content as Chat;

                if (chat.global) {
                    messages.global.push(chat)
                } else {
                    messages.match.push(chat)
                }

                break
            case MessageType.STATE_SYNC:
                content = message.content as StateSync
                setDice(content.dice)
                setCurrentPlayer(content.currentPlayer)
                setGameState(content.state)
                setResync(true);
                break;
            case MessageType.CHOOSE_PIECE:
                content = message.content as PieceSync
                choosePiece(content)
                break;
            case MessageType.FULL_SYNC:
                content = message.content as FullSync
                messages.global = content.globalChat
                if (content.matchChat.length > 0) {
                    messages.match = content.matchChat
                }
                game.syncPieces(content.pieces)
                syncPlayers(content.players)
                players.spectators = content.spectators
                players.queue = content.queue
                setDice(content.state.dice)
                setCurrentPlayer(content.state.currentPlayer)
                setGameState(content.state.state)
                setResync(true);
                video.sync(content.peers)
                break;
            case MessageType.VIDEO_SYNC:
                video.sync(message.content as string[])
                break
            case MessageType.COMMAND:
                const { command, data } = message.content as Command

                switch (command) {
                    case CommandType.ENQUEUE:
                        const queueUser = data as string;
                        if (!players.queue.includes(queueUser)) {
                            players.queue.push(queueUser)
                            players.spectators = players.spectators.filter(n => n !== queueUser)
                        }
                        break;
                    case CommandType.DEQUEUE:
                        const dequeueUser = data as string;
                        if (players.queue.includes(dequeueUser)) {
                            players.spectators.push(dequeueUser)
                            players.queue = players.queue.filter(n => n !== dequeueUser)
                        }
                        break;
                }
        }
    }
}

function send(data: string | ArrayBufferLike) {
    if (socket === null) {
        throw Error("Socket não está conectado")
    }

    socket.send(data)
}

export { connect, send };
