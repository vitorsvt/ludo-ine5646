import type { PieceSync, StateSync } from "./message.ts";

const enum Color {
    YELLOW = "orange",
    BLUE = "blue",
    RED = "red",
    GREEN = "green"
}

const enum PieceState {
    WAITING = "waiting",
    PLAYING = "playing",
    FINISHED = "finished",
}

class Piece {
    static idCounter = 0;
    id: number;
    color: Color;
    tile: Tile | null;
    state: PieceState = PieceState.WAITING;

    constructor(color: Color) {
        this.id = ++Piece.idCounter;
        this.color = color;
        this.tile = null;
    }

    move(count: number) {
        if (this.tile === null) {
            throw Error("Piece is not in a tile")
        }

        if (this.state === PieceState.WAITING && count === 6) {
            this.state = PieceState.PLAYING
            count = 1 // Caso esteja no início e tire 6, vai para o primeiro quadrado
        }

        let backwards = false;
        while (count > 0) {
            if (!backwards) {
                if (this.tile.next.length === 2) {
                    // Na casa que divide para a fileira final,
                    // verificar se a cor é a dessa peça

                    let home = this.tile.next.find(t => t.type === TileType.HOME);
                    let other = this.tile.next.find(t => t.type !== TileType.HOME);

                    this.tile.remove(this);

                    if (home?.color === this.color) {
                        home?.add(this);
                    } else {
                        other?.add(this);
                    }
                } else if (this.tile.next.length === 1) {
                    // Simplesmente mover a peça para frente
                    const next = this.tile.next[0];

                    this.tile.remove(this);
                    next?.add(this);
                } else if (this.tile.next.length === 0) {
                    // Andar para trás, na fileira final
                    backwards = true;
                }
            }

            if (backwards) {
                if (this.tile.prev === undefined || this.tile.prev.length === 0) {
                    throw Error("No previous tiles in home row")
                }

                const prev = this.tile.prev[0];
                this.tile.remove(this)
                prev?.add(this)
            }

            count--;
        }

        // Último quadrado não tem seguintes
        if (this.tile.next.length === 0) {
            this.state = PieceState.FINISHED
        }

        // Caso esteja em um local desprotegido, comer peças de outra cor
        return this.tile.pieces.filter(p => (
            p.color !== this.color &&
            p.color !== this.tile!.color

        ))
    }

    asState(): PieceSync {
        return {
            id: this.id,
            state: this.state,
            x: this.tile?.x,
            z: this.tile?.z
        }
    }
}

const enum TileType {
    NEUTRAL = "neutral",
    HOME = "home",
    START = "start",
    SPAWN = "spawn",
    BRANCH = "branch"
}

class Tile {
    x: number;
    z: number;
    type: TileType;
    color: Color | null;
    next: Tile[];
    prev?: Tile[]; // Necessário apenas para a coluna final
    pieces: Piece[];

    constructor(x: number, z: number, type: TileType, color: Color | null = null) {
        this.x = x
        this.z = z
        this.type = type
        this.color = color
        this.next = []
        this.pieces = []

        if (type === TileType.HOME) {
            this.prev = []
        }
    }

    add(piece: Piece) {
        if (piece.tile !== null) {
            throw Error("Tried to add piece to tile without removing from previous tile")
        }
        this.pieces.push(piece);
        piece.tile = this;
    }

    remove(piece: Piece) {
        this.pieces = this.pieces.filter(p => p.id !== piece.id);
        piece.tile = null;
    }
}

class Board {
    static colors = [
        Color.YELLOW,
        Color.BLUE,
        Color.RED,
        Color.GREEN
    ];

    tiles: Tile[];
    pieces: Piece[];

    constructor() {
        this.tiles = Board.createTileGraph()
        this.pieces = []

        Piece.idCounter = 0;
        for (const color of Board.colors) {
            for (let i = 0; i < 4; i++) {
                const piece = new Piece(color);
                this.pieces.push(piece);

                this.movePieceToSpawn(piece)
            }
        }
    }

    movePieceToSpawn(piece: Piece) {
        if (piece.tile !== null) {
            piece.tile.remove(piece);
        }

        const tile = this.tiles.find(
            t => t.color === piece.color &&
                t.type === TileType.SPAWN &&
                t.pieces.length === 0
        )

        if (tile) {
            piece.state = PieceState.WAITING
            tile.add(piece);
        } else {
            throw Error("Erro ao posicionar peça nas posições iniciais")
        }
    }

    reset() {
        for (const piece of this.pieces) {
            this.movePieceToSpawn(piece);
        }
    }

    static rotateCoordinates([x, z]: [number, number], rotationCount: number): [number, number] {
        for (let i = 0; i < rotationCount; i++) {
            [x, z] = [-z, x];
        }

        return [x, z];
    }

    static createTileGraph() {
        const tiles: Tile[] = [];

        let current: Tile
        let previous: Tile;

        Board.colors.forEach((color, i) => {
            for (let pos = -2; pos >= -7; pos--) {
                const [x, z] = Board.rotateCoordinates([-1, pos], i);
                current = new Tile(x, z, TileType.NEUTRAL);
                tiles.push(current);
                if (previous) {
                    previous.next.push(current);
                }
                previous = current;
            }

            const [x, z] = Board.rotateCoordinates([0, -7], i);
            const branch = new Tile(x, z, TileType.BRANCH);
            tiles.push(branch);
            previous.next.push(branch);

            previous = branch;
            for (let pos = -6; pos <= -1; pos++) {
                const [x, z] = Board.rotateCoordinates([0, pos], i);
                current = new Tile(x, z, TileType.HOME, color);
                tiles.push(current);
                previous.next.push(current);
                current.prev!.push(previous)
                previous = current;
            }

            previous = branch;
            for (let pos = -7; pos <= -2; pos++) {
                const [x, z] = Board.rotateCoordinates([1, pos], i);

                let current;
                if (pos === -6) {
                    current = new Tile(x, z, TileType.START, color);
                    for (const [x, z] of [
                        [3.5, -4.5],
                        [4.5, -5.5],
                        [5.5, -4.5],
                        [4.5, -3.5],
                    ]) {
                        const [sx, sz] = Board.rotateCoordinates([x!, z!], i);
                        const spawn = new Tile(sx, sz, TileType.SPAWN, color);
                        spawn.next.push(current);
                        tiles.push(spawn);
                    }
                } else {
                    current = new Tile(x, z, TileType.NEUTRAL);
                }

                tiles.push(current);
                previous.next.push(current);
                previous = current;
            }
        });

        tiles[tiles.length - 1]!.next.push(tiles[0]!);

        return tiles;
    }
}

const enum PlayerController {
    HUMAN = "human",
    AI = "ai"
}

interface Player {
    username: string,
    color: Color,
    finished: boolean,
    controller: PlayerController
}

const enum GameState {
    LOBBY = "lobby",
    DICE = "dice",
    PIECE = "piece",
    END = "end"
}

class Game {
    static idCounter = 1;

    id: number
    state: GameState = GameState.LOBBY
    board: Board;
    dice = 0;
    players: Player[];
    currentPlayer: Player | undefined;

    constructor() {
        this.id = Game.idCounter++
        this.board = new Board();
        this.players = [];
    }

    addPlayer(username: string, controller: PlayerController) {
        if (this.players.length === 4) {
            throw Error('Too many players');
        }

        const availableColors = Board.colors.filter(color => {
            for (const player of this.players) {
                if (player.color === color) {
                    return false;
                }
            }
            return true;
        });

        const color = availableColors[Math.floor(Math.random() * availableColors.length)];

        this.players.push({
            username,
            color: color!,
            controller,
            finished: false
        });
    }

    checkEnd() {
        const finishedPlayers = this.players.filter(player => {
            if (!player.finished) {
                const piecesInEnd = this.board.pieces.filter(
                    p => p.color === player.color && p.state === PieceState.FINISHED
                );

                if (piecesInEnd.length === 4) {
                    player.finished = true;
                }
            }

            return player.finished;
        });

        const finished = finishedPlayers.length === this.players.length - 1;

        if (finished) {
            this.state = GameState.END
        }

        return finished;
    }

    rollDice() {
        if (this.state !== GameState.DICE || this.currentPlayer === undefined) {
            throw Error("Can't throw the dice right now")
        }

        // Adiciona um pouco de viés ao dado para evitar um jogador
        // nunca conseguir tirar nenhuma peça enquanto os outros conseguem
        const color = this.currentPlayer.color
        const waitingPieces = this.board.pieces.filter(p => p.state === PieceState.WAITING)
        const colorWaitingPieces = waitingPieces.filter(p => p.color === color)

        this.state = GameState.PIECE;

        let chanceOfSix = 1 / 6
        const maxBoost = 2 / 6 // Ajuda máxima de +0.333... (todos os outros com peças fora)
        if (colorWaitingPieces.length === 4) {
            const ratio = colorWaitingPieces.length / waitingPieces.length
            chanceOfSix += ratio * maxBoost
        }

        if (Math.random() < chanceOfSix) {
            // Tentar o seis, com uma possível ajuda
            this.dice = 6
        } else {
            // Tentar os demais números
            this.dice = Math.ceil(Math.random() * 5);
        }

        this.dice += 3

        this.state = GameState.PIECE;
    }

    isPieceValidChoice(piece: Piece): { valid: boolean, reason?: string } {
        if (this.state !== GameState.PIECE) {
            return { valid: false, reason: "Can't choose piece right now" }
        }

        if (this.currentPlayer === undefined) {
            return { valid: false, reason: "No player is currently active" }
        }

        if (piece.color !== this.currentPlayer.color) {
            return { valid: false, reason: "Piece not of current player color" }
        }

        if (piece.state === PieceState.FINISHED) {
            return { valid: false, reason: "Can't move a finished piece" }
        }

        if (this.dice !== 6 && piece.state === PieceState.WAITING) {
            return { valid: false, reason: "Can't move a waiting piece without a 6" }
        }

        return { valid: true }
    }

    choosePiece(piece: Piece) {
        const { valid, reason } = this.isPieceValidChoice(piece)

        if (valid) {
            const eatenPieces = piece.move(this.dice);
            eatenPieces.map(p => this.board.movePieceToSpawn(p))
            this.nextRoll();
        }
    }

    nextRoll() {
        if (this.currentPlayer === undefined) {
            throw Error("No player is currently active")
        }

        this.checkEnd()

        const nextColor = (c: Color) => {
            switch (c) {
                case Color.YELLOW: return Color.BLUE
                case Color.BLUE: return Color.RED
                case Color.RED: return Color.GREEN
                case Color.GREEN: return Color.YELLOW
            }
        }

        if (this.dice !== 6) {
            const currentColor = this.currentPlayer.color
            const nextPlayer = this.players.find(p => p.color === nextColor(currentColor))
            if (nextPlayer === undefined) {
                throw Error("Couldn't find next player")
            }
            this.currentPlayer = nextPlayer;
        }

        this.state = GameState.DICE;
    }

    reset() {
        this.id = Game.idCounter++;
        this.players = [];
        this.dice = 0;
        this.currentPlayer = undefined;
        this.board.reset();
    }

    start() {
        if (this.players.length !== 4) {
            throw Error("Too few players")
        }

        const i = Math.floor(Math.random() * this.players.length);
        this.currentPlayer = this.players[i];
        this.state = GameState.DICE;
    }

    botTurn() {
        return (
            (this.state === GameState.DICE || this.state === GameState.PIECE) &&
            this.currentPlayer !== undefined &&
            this.currentPlayer.controller === PlayerController.AI &&
            this.currentPlayer.finished === false
        )
    }

    getRandomValidPiece() {
        const validChoices = this.board.pieces.filter(piece => {
            return this.isPieceValidChoice(piece).valid
        })

        if (validChoices.length > 0) {
            return validChoices[Math.floor(validChoices.length * Math.random())]
        }

        return undefined
    }

    asState(): StateSync {
        return {
            currentPlayer: this.currentPlayer ? {
                username: this.currentPlayer.username,
                color: this.currentPlayer.color,
                finished: this.currentPlayer.finished,
                controller: this.currentPlayer.controller
            } : undefined,
            dice: this.dice,
            state: this.state
        }
    }

    syncPieces(pieces: PieceSync[]) {
        pieces.forEach(piece => {
            const found = this.board.pieces.find(p => p.id === piece.id)

            if (!found) {
                throw Error("Piece not found while syncing")
            }

            const tile = this.board.tiles.find(t => t.x === piece.x && t.z === piece.z)

            if (!tile) {
                throw Error("Could not find x and z position in the tileset")
            }

            found.tile?.remove(found)
            tile.add(found)
            found.state = piece.state
        })
    }
}


export {
    Board,
    Piece,
    PieceState,
    PlayerController,
    Tile,
    Color,
    Game,
    GameState
}

export type { Player }