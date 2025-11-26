import { Color, GameState, PlayerController, type Player } from "../../common/models/game.ts"
import { Game } from "../../common/models/game.ts";
import type { ChoosePiece } from "../../common/models/message.ts";

export const game = new Game()

let resync = $state(false);
export function setResync(value: boolean) {
    resync = value;
}
export function getResync() {
    return resync;
}

let dice = $state(3)
export function setDice(value: number) {
    dice = value
    game.dice = dice
}
export function getDice() {
    return dice
}

let currentPlayer = $state<Player>()
export function setCurrentPlayer(player: Player | undefined) {
    currentPlayer = player === undefined ? player : game.players.find(p => (
        p.username === player.username &&
        p.color === player.color
    ))
    game.currentPlayer = currentPlayer
}
export function getCurrentPlayer() {
    return currentPlayer
}

let gameState = $state<GameState>(GameState.DICE)
export function setGameState(state: GameState) {
    gameState = state
    game.state = gameState
}
export function getGameState() {
    return gameState
}

export let players = $state({
    active: [] as Player[],
    queue: [] as string[],
    spectators: [] as string[],

    humans() {
        return this.active.filter(p => p.controller === PlayerController.HUMAN)
    },

    isPlaying(player: string) {
        return this.humans().map(p => p.username).includes(player)
    }
})

export function syncPlayers(p: Player[]) {
    players.active = p.map(p => ({
        username: p.username,
        finished: p.finished,
        color: p.color,
        controller: p.controller,
    }))

    game.players = players.active
}

export function choosePiece(choice: ChoosePiece) {
    const piece = game.board.pieces.find(p => p.id === choice.id)

    if (piece === undefined) {
        throw Error("Piece ID was not found")
    } else {
        game.choosePiece(piece)
        setResync(true)
    }
}
