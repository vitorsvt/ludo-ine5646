import type { GameState, PieceState, Player } from "./game.ts"

/**
 * Types of messages in the communication
 */
export const enum MessageType {
    CHAT = "chat",
    COMMAND = "command",
    FULL_SYNC = "full_sync",
    PIECE_SYNC = "piece_sync",
    PLAYER_SYNC = "player_sync",
    STATE_SYNC = "state_sync",
    CHOOSE_PIECE = "choose_piece",
    GREET = "greet",
    FILL_BOTS = "fill_bots",
    VIDEO_READY = "video_ready",
    VIDEO_SYNC = "video_sync",
    START_RECORDING = "start_recording",
    STOP_RECORDING = "stop_recording",
}

/**
 * 
 */
export interface Message {
    type: MessageType,
    token?: string,
    content?: Chat | Player | PieceSync | StateSync | FullSync | Command | ChoosePiece | string | string[]
}

export interface Chat {
    timestamp: number,
    body: string,
    global: boolean,
    author?: string,
}

export interface PieceSync {
    id: number,
    x: number | undefined,
    z: number | undefined,
    state: PieceState
}

export interface StateSync {
    currentPlayer: Player | undefined
    state: GameState
    dice: number
}

export interface FullSync {
    state: StateSync,
    queue: string[],
    spectators: string[],
    players: Player[],
    pieces: PieceSync[],
    globalChat: Chat[],
    matchChat: Chat[],
    peers: string[]
}

export const enum CommandType {
    ENQUEUE = "enqueue",
    DEQUEUE = "dequeue",
    ROLL_DICE = "roll_dice",
    CHOOSE_PIECE = "choose_piece",
}

export interface Command {
    command: CommandType,
    data?: ChoosePiece | string,
}

export interface ChoosePiece {
    id: number
}
