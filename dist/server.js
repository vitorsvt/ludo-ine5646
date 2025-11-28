var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/server/server.ts
import getCountries, { getCitiesOfState, getStatesOfCountry } from "@countrystatecity/countries";
import express from "express";
import jwt3 from "jsonwebtoken";
import path2 from "path";
import { fileURLToPath } from "url";

// src/server/database.ts
import { MongoClient } from "mongodb";
import { IsNotEmpty, Length, NotEquals, validateOrReject } from "class-validator";
import { plainToInstance } from "class-transformer";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
var uri = "mongodb://localhost:27017";
var options = {};
var client;
var clientPromise;
if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}
client = new MongoClient(uri, options);
clientPromise = client.connect();
async function getDatabase() {
  const client2 = await clientPromise;
  return client2.db("ludo");
}
async function saveVideo(username, matchId2, location) {
  const db = await getDatabase();
  const result = await db.collection("users").updateOne({ username }, {
    $push: {
      videos: {
        matchId: matchId2,
        location
      }
    }
  });
  return result;
}
async function incrementPoints(username, increment) {
  const db = await getDatabase();
  const result = await db.collection("users").updateOne({ username }, {
    $inc: {
      score: increment
    }
  });
}
async function getLatestMatchId() {
  const db = await getDatabase();
  const match = await db.collection("matches").find({}).sort({ id: -1 }).limit(1).toArray();
  if (match.length > 0) {
    return match[0].id;
  }
  return 0;
}
async function getUsers() {
  const db = await getDatabase();
  const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();
  return users;
}
async function getUserByName(username) {
  const db = await getDatabase();
  const users = db.collection("users");
  const user = await users.find({ username }, { projection: { password: 0 } }).limit(1).next();
  return user;
}
var LoginUser = class {
  username;
  password;
};
__decorateClass([
  IsNotEmpty(),
  Length(3, 20)
], LoginUser.prototype, "username", 2);
__decorateClass([
  IsNotEmpty()
], LoginUser.prototype, "password", 2);
async function loginUser(plainCredentials) {
  const db = await getDatabase();
  const users = db.collection("users");
  const credentials = plainToInstance(LoginUser, plainCredentials);
  await validateOrReject(credentials);
  const user = await users.find({ username: credentials.username }).limit(1).next();
  if (user === null) {
    throw [{
      message: "Invalid username or password"
    }];
  }
  const matches = await compare(credentials.password, user.password);
  if (!matches) {
    throw [{
      message: "Invalid username or password"
    }];
  }
  const token = jwt.sign(
    { id: user._id, username: user.username },
    "INE5646",
    { expiresIn: "6h" }
  );
  return token;
}
var CreateUser = class {
  username;
  country;
  state;
  city;
  password;
  repeatedPassword;
  image;
};
__decorateClass([
  IsNotEmpty(),
  Length(3, 20),
  NotEquals("BOT")
], CreateUser.prototype, "username", 2);
__decorateClass([
  IsNotEmpty(),
  Length(2, 2)
], CreateUser.prototype, "country", 2);
__decorateClass([
  IsNotEmpty(),
  Length(2, 2)
], CreateUser.prototype, "state", 2);
__decorateClass([
  IsNotEmpty()
], CreateUser.prototype, "city", 2);
__decorateClass([
  IsNotEmpty()
], CreateUser.prototype, "password", 2);
__decorateClass([
  IsNotEmpty()
], CreateUser.prototype, "repeatedPassword", 2);
async function createUser(plainUser) {
  const db = await getDatabase();
  const users = db.collection("users");
  const createUser2 = plainToInstance(CreateUser, plainUser);
  await validateOrReject(createUser2);
  const passwordMatch = createUser2.password === createUser2.repeatedPassword;
  if (!passwordMatch) {
    throw [
      {
        message: "Password does not match"
      }
    ];
  }
  const exists = await users.find({ username: createUser2.username }).hasNext();
  if (exists) {
    throw [
      {
        message: "Username already exists"
      }
    ];
  }
  const hashedPassword = await hash(createUser2.password, 10);
  const result = await users.insertOne({
    username: createUser2.username,
    country: createUser2.country,
    state: createUser2.state,
    city: createUser2.city,
    password: hashedPassword,
    image: void 0,
    videos: [],
    score: 0
  });
  return result;
}

// src/server/manager.ts
import jwt2 from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";

// src/common/models/game.ts
var Piece = class _Piece {
  static idCounter = 0;
  id;
  color;
  tile;
  state = "waiting" /* WAITING */;
  constructor(color) {
    this.id = ++_Piece.idCounter;
    this.color = color;
    this.tile = null;
  }
  move(count) {
    if (this.tile === null) {
      throw Error("Piece is not in a tile");
    }
    if (this.state === "waiting" /* WAITING */ && count === 6) {
      this.state = "playing" /* PLAYING */;
      count = 1;
    }
    let backwards = false;
    while (count > 0) {
      if (!backwards) {
        if (this.tile.next.length === 2) {
          let home = this.tile.next.find((t) => t.type === "home" /* HOME */);
          let other = this.tile.next.find((t) => t.type !== "home" /* HOME */);
          this.tile.remove(this);
          if (home?.color === this.color) {
            home?.add(this);
          } else {
            other?.add(this);
          }
        } else if (this.tile.next.length === 1) {
          const next = this.tile.next[0];
          this.tile.remove(this);
          next?.add(this);
        } else if (this.tile.next.length === 0) {
          backwards = true;
        }
      }
      if (backwards) {
        if (this.tile.prev === void 0 || this.tile.prev.length === 0) {
          throw Error("No previous tiles in home row");
        }
        const prev = this.tile.prev[0];
        this.tile.remove(this);
        prev?.add(this);
      }
      count--;
    }
    if (this.tile.next.length === 0) {
      this.state = "finished" /* FINISHED */;
    }
    return this.tile.pieces.filter((p) => p.color !== this.color && p.color !== this.tile.color);
  }
  asState() {
    return {
      id: this.id,
      state: this.state,
      x: this.tile?.x,
      z: this.tile?.z
    };
  }
};
var Tile = class {
  x;
  z;
  type;
  color;
  next;
  prev;
  // Necessário apenas para a coluna final
  pieces;
  constructor(x, z, type, color = null) {
    this.x = x;
    this.z = z;
    this.type = type;
    this.color = color;
    this.next = [];
    this.pieces = [];
    if (type === "home" /* HOME */) {
      this.prev = [];
    }
  }
  add(piece) {
    if (piece.tile !== null) {
      throw Error("Tried to add piece to tile without removing from previous tile");
    }
    this.pieces.push(piece);
    piece.tile = this;
  }
  remove(piece) {
    this.pieces = this.pieces.filter((p) => p.id !== piece.id);
    piece.tile = null;
  }
};
var Board = class _Board {
  static colors = [
    "orange" /* YELLOW */,
    "blue" /* BLUE */,
    "red" /* RED */,
    "green" /* GREEN */
  ];
  tiles;
  pieces;
  constructor() {
    this.tiles = _Board.createTileGraph();
    this.pieces = [];
    Piece.idCounter = 0;
    for (const color of _Board.colors) {
      for (let i = 0; i < 4; i++) {
        const piece = new Piece(color);
        this.pieces.push(piece);
        this.movePieceToSpawn(piece);
      }
    }
  }
  movePieceToSpawn(piece) {
    if (piece.tile !== null) {
      piece.tile.remove(piece);
    }
    const tile = this.tiles.find(
      (t) => t.color === piece.color && t.type === "spawn" /* SPAWN */ && t.pieces.length === 0
    );
    if (tile) {
      piece.state = "waiting" /* WAITING */;
      tile.add(piece);
    } else {
      throw Error("Erro ao posicionar pe\xE7a nas posi\xE7\xF5es iniciais");
    }
  }
  reset() {
    for (const piece of this.pieces) {
      this.movePieceToSpawn(piece);
    }
  }
  static rotateCoordinates([x, z], rotationCount) {
    for (let i = 0; i < rotationCount; i++) {
      [x, z] = [-z, x];
    }
    return [x, z];
  }
  static createTileGraph() {
    const tiles = [];
    let current;
    let previous;
    _Board.colors.forEach((color, i) => {
      for (let pos = -2; pos >= -7; pos--) {
        const [x2, z2] = _Board.rotateCoordinates([-1, pos], i);
        current = new Tile(x2, z2, "neutral" /* NEUTRAL */);
        tiles.push(current);
        if (previous) {
          previous.next.push(current);
        }
        previous = current;
      }
      const [x, z] = _Board.rotateCoordinates([0, -7], i);
      const branch = new Tile(x, z, "branch" /* BRANCH */);
      tiles.push(branch);
      previous.next.push(branch);
      previous = branch;
      for (let pos = -6; pos <= -1; pos++) {
        const [x2, z2] = _Board.rotateCoordinates([0, pos], i);
        current = new Tile(x2, z2, "home" /* HOME */, color);
        tiles.push(current);
        previous.next.push(current);
        current.prev.push(previous);
        previous = current;
      }
      previous = branch;
      for (let pos = -7; pos <= -2; pos++) {
        const [x2, z2] = _Board.rotateCoordinates([1, pos], i);
        let current2;
        if (pos === -6) {
          current2 = new Tile(x2, z2, "start" /* START */, color);
          for (const [x3, z3] of [
            [3.5, -4.5],
            [4.5, -5.5],
            [5.5, -4.5],
            [4.5, -3.5]
          ]) {
            const [sx, sz] = _Board.rotateCoordinates([x3, z3], i);
            const spawn2 = new Tile(sx, sz, "spawn" /* SPAWN */, color);
            spawn2.next.push(current2);
            tiles.push(spawn2);
          }
        } else {
          current2 = new Tile(x2, z2, "neutral" /* NEUTRAL */);
        }
        tiles.push(current2);
        previous.next.push(current2);
        previous = current2;
      }
    });
    tiles[tiles.length - 1].next.push(tiles[0]);
    return tiles;
  }
};
var Game = class _Game {
  static idCounter = 1;
  id;
  state = "lobby" /* LOBBY */;
  board;
  dice = 0;
  players;
  currentPlayer;
  winners;
  constructor() {
    this.id = _Game.idCounter++;
    this.board = new Board();
    this.players = [];
    this.winners = [];
  }
  addPlayer(username, controller) {
    if (this.players.length === 4) {
      throw Error("Too many players");
    }
    const availableColors = Board.colors.filter((color2) => {
      for (const player of this.players) {
        if (player.color === color2) {
          return false;
        }
      }
      return true;
    });
    const color = availableColors[Math.floor(Math.random() * availableColors.length)];
    this.players.push({
      username,
      color,
      controller,
      finished: false
    });
  }
  checkEnd() {
    const finishedPlayers = this.players.filter((player) => {
      if (!player.finished) {
        const piecesInEnd = this.board.pieces.filter(
          (p) => p.color === player.color && p.state === "finished" /* FINISHED */
        );
        if (piecesInEnd.length === 4) {
          player.finished = true;
          this.winners.push(player);
        }
      }
      return player.finished;
    });
    const finished = finishedPlayers.length === this.players.length - 1;
    if (finished) {
      this.state = "end" /* END */;
    }
    return finished;
  }
  rollDice() {
    if (this.state !== "dice" /* DICE */ || this.currentPlayer === void 0) {
      throw Error("Can't throw the dice right now");
    }
    const color = this.currentPlayer.color;
    const waitingPieces = this.board.pieces.filter((p) => p.state === "waiting" /* WAITING */);
    const colorWaitingPieces = waitingPieces.filter((p) => p.color === color);
    this.state = "piece" /* PIECE */;
    let chanceOfSix = 1 / 6;
    const maxBoost = 2 / 6;
    if (colorWaitingPieces.length === 4) {
      const ratio = colorWaitingPieces.length / waitingPieces.length;
      chanceOfSix += ratio * maxBoost;
    }
    if (Math.random() < chanceOfSix) {
      this.dice = 6;
    } else {
      this.dice = Math.ceil(Math.random() * 5);
    }
    this.state = "piece" /* PIECE */;
  }
  isPieceValidChoice(piece) {
    if (this.state !== "piece" /* PIECE */) {
      return { valid: false, reason: "Can't choose piece right now" };
    }
    if (this.currentPlayer === void 0) {
      return { valid: false, reason: "No player is currently active" };
    }
    if (piece.color !== this.currentPlayer.color) {
      return { valid: false, reason: "Piece not of current player color" };
    }
    if (piece.state === "finished" /* FINISHED */) {
      return { valid: false, reason: "Can't move a finished piece" };
    }
    if (this.dice !== 6 && piece.state === "waiting" /* WAITING */) {
      return { valid: false, reason: "Can't move a waiting piece without a 6" };
    }
    return { valid: true };
  }
  choosePiece(piece) {
    const { valid, reason } = this.isPieceValidChoice(piece);
    if (valid) {
      const eatenPieces = piece.move(this.dice);
      eatenPieces.map((p) => this.board.movePieceToSpawn(p));
      this.nextRoll();
    }
  }
  nextRoll() {
    if (this.currentPlayer === void 0) {
      throw Error("No player is currently active");
    }
    this.checkEnd();
    const nextColor = (c) => {
      switch (c) {
        case "orange" /* YELLOW */:
          return "blue" /* BLUE */;
        case "blue" /* BLUE */:
          return "red" /* RED */;
        case "red" /* RED */:
          return "green" /* GREEN */;
        case "green" /* GREEN */:
          return "orange" /* YELLOW */;
      }
    };
    if (this.dice !== 6) {
      const currentColor = this.currentPlayer.color;
      const nextPlayer = this.players.find((p) => p.color === nextColor(currentColor));
      if (nextPlayer === void 0) {
        throw Error("Couldn't find next player");
      }
      this.currentPlayer = nextPlayer;
    }
    this.state = "dice" /* DICE */;
  }
  reset() {
    this.id = _Game.idCounter++;
    this.players = [];
    this.dice = 0;
    this.currentPlayer = void 0;
    this.winners = [];
    this.board.reset();
  }
  start() {
    if (this.players.length !== 4) {
      throw Error("Too few players");
    }
    const i = Math.floor(Math.random() * this.players.length);
    this.currentPlayer = this.players[i];
    this.state = "dice" /* DICE */;
  }
  botTurn() {
    return (this.state === "dice" /* DICE */ || this.state === "piece" /* PIECE */) && this.currentPlayer !== void 0 && this.currentPlayer.controller === "ai" /* AI */ && this.currentPlayer.finished === false;
  }
  getRandomValidPiece() {
    const validChoices = this.board.pieces.filter((piece) => {
      return this.isPieceValidChoice(piece).valid;
    });
    if (validChoices.length > 0) {
      return validChoices[Math.floor(validChoices.length * Math.random())];
    }
    return void 0;
  }
  asState() {
    return {
      currentPlayer: this.currentPlayer ? {
        username: this.currentPlayer.username,
        color: this.currentPlayer.color,
        finished: this.currentPlayer.finished,
        controller: this.currentPlayer.controller
      } : void 0,
      dice: this.dice,
      state: this.state
    };
  }
  syncPieces(pieces) {
    pieces.forEach((piece) => {
      const found = this.board.pieces.find((p) => p.id === piece.id);
      if (!found) {
        throw Error("Piece not found while syncing");
      }
      const tile = this.board.tiles.find((t) => t.x === piece.x && t.z === piece.z);
      if (!tile) {
        throw Error("Could not find x and z position in the tileset");
      }
      found.tile?.remove(found);
      tile.add(found);
      found.state = piece.state;
    });
  }
};

// src/server/manager.ts
import path from "path";
import { spawn } from "child_process";
import fs from "fs";
var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var Manager = class {
  game;
  server;
  sockets = /* @__PURE__ */ new Map();
  globalChat = [];
  matchChat = [];
  queue = [];
  spectators = [];
  recordings = /* @__PURE__ */ new Map();
  turnTimer = null;
  constructor({ nextId, port }) {
    this.game = new Game();
    this.game.id = nextId + 1;
    this.server = new WebSocketServer({ port });
    console.log(`[server] Websocket rodando em ws://localhost:${port}`);
    this.server.on("connection", (ws) => {
      ws.send(JSON.stringify(this.createFullSyncMessage()));
      ws.on("close", () => {
        if (ws.username) {
          const storedSocket = this.sockets.get(ws.username);
          if (storedSocket === ws) {
            this.sockets.delete(ws.username);
          }
          this.handleStopRecording(ws.username);
        }
        if (ws.peerId) {
          const players = this.game.players.filter((p) => p.controller === "human" /* HUMAN */);
          const peerIds = players.map((p) => this.sockets.get(p.username)?.peerId).filter((p) => p !== void 0);
          console.log(peerIds);
          this.broadcast({
            type: "video_sync" /* VIDEO_SYNC */,
            content: peerIds
          });
        }
      });
      ws.on("message", async (data, isBinary) => {
        if (isBinary && ws.username !== void 0) {
          this.handleRecordingPacket(ws.username, data);
          return;
        }
        const messageString = data.toString();
        let message;
        try {
          message = JSON.parse(messageString);
        } catch (e) {
          return console.error("[error] Failed to parse message");
        }
        const user = this.authenticate(message.token, ws);
        if (!user) return;
        if (ws.username !== user.username) {
          ws.username = user.username;
          this.sockets.set(user.username, ws);
          const players = this.game.players.filter((p) => p.controller !== "ai" /* AI */).map((p) => p.username);
          const isPlayer = players.includes(user.username);
          if (isPlayer) {
            const payload = JSON.stringify(this.createFullSyncMessage(true));
            ws.send(payload);
          }
        }
        console.log(`[${message.type}] from ${user.username}`);
        await this.handleMessage(ws, message, user.username);
      });
    });
  }
  authenticate(token, ws) {
    if (!token) {
      console.log("[error] closed unauthenticated socket (no token)...");
      ws.close(3e3, "Unauthenticated");
      return null;
    }
    try {
      const decoded = jwt2.verify(token, "INE5646");
      return { id: decoded.id, username: decoded.username };
    } catch (error) {
      console.log("[error] closed socket with bad token...");
      ws.close(3e3, "Unauthenticated");
      return null;
    }
  }
  async handleMessage(ws, message, username) {
    switch (message.type) {
      case "greet" /* GREET */:
        this.handleGreet(username);
        break;
      case "chat" /* CHAT */:
        this.handleChat(message.content, username);
        break;
      case "fill_bots" /* FILL_BOTS */:
        this.handleFillBots(username);
        break;
      case "command" /* COMMAND */:
        await this.handleCommand(ws, message.content, username);
        break;
      case "video_ready" /* VIDEO_READY */:
        this.handleConnectVideo(ws, message.content, username);
        break;
      case "start_recording" /* START_RECORDING */:
        this.handleStartRecording(username);
        break;
      case "stop_recording" /* STOP_RECORDING */:
        this.handleStopRecording(username);
        break;
    }
  }
  handleStartRecording(username) {
    if (!fs.existsSync("public/uploads")) {
      fs.mkdirSync("public/uploads");
    }
    const filePath = path.join("uploads", `${username}_${this.game.id}_${Date.now()}.webm`);
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-f",
      "webm",
      "-i",
      "pipe:0",
      "-c",
      "copy",
      // Evitar problema com timestamp dos quadros
      "-fflags",
      "+genpts",
      "-avoid_negative_ts",
      "make_zero",
      path.join("public", filePath)
    ]);
    console.log(`[server] iniciando grava\xE7\xE3o em ${filePath}`);
    ffmpeg.stderr.on("data", (data) => {
      console.log(`[ffmpeg:${username}] ${data}`);
    });
    ffmpeg.on("close", (code) => {
      console.log(`[ffmpeg:${username}] ${code}`);
      if (code !== 0) {
        console.error(`[ffmpeg:${username}] ocorreu um erro`);
      }
    });
    ffmpeg.on("error", (err) => {
      console.error(`[ffmpeg ${username}] falha ao iniciar processo:`, err);
    });
    saveVideo(username, this.game.id, filePath);
    this.recordings.set(username, ffmpeg);
  }
  handleStopRecording(username) {
    const ffmpeg = this.recordings.get(username);
    if (ffmpeg) {
      ffmpeg.stdin.end();
      console.log(`[server] grava\xE7\xE3o finalizada por ${username}`);
      this.recordings.delete(username);
    }
  }
  handleRecordingPacket(username, data) {
    const ffmpeg = this.recordings.get(username);
    if (ffmpeg && ffmpeg.stdin.writable) {
      const chunk = Buffer.from(data);
      if (chunk.length < 100) {
        console.warn("[server] PACOTE SUSPEITO, IGNORANDO...");
        return;
      }
      try {
        ffmpeg.stdin.write(chunk, (err) => {
          if (err) {
            console.error(`[server] erro de escrita no pipe do ffmpeg (${username})`);
            this.handleStopRecording(username);
          }
        });
      } catch (error) {
        console.error(`[server] erro ao escrever chunk (${username})`);
      }
    } else {
      console.warn(`[server] tentativa de enviar pacote de v\xEDdeo a um processo fechado (${username})`);
    }
  }
  handleConnectVideo(socket, peerId, username) {
    const players = this.game.players.filter((p) => p.controller === "human" /* HUMAN */);
    const isUserPlayer = players.find((p) => p.username === username) !== void 0;
    if (isUserPlayer) {
      socket.peerId = peerId;
      const peerIds = players.map((p) => this.sockets.get(p.username)?.peerId).filter((p) => p !== void 0);
      this.broadcastPlayers({
        type: "video_sync" /* VIDEO_SYNC */,
        content: peerIds
      });
    }
  }
  handleGreet(username) {
    if (!this.spectators.includes(username) && !this.queue.includes(username)) {
      this.spectators.push(username);
      this.broadcast({
        type: "greet" /* GREET */,
        content: username
      });
    }
  }
  handleChat(chat, username) {
    chat.author = username;
    if (!chat.global) {
      const players = this.game.players.filter((p) => p.controller === "human" /* HUMAN */);
      if (players.find((p) => p.username === username) !== void 0) {
        this.matchChat.push(chat);
        this.broadcastPlayers({
          type: "chat" /* CHAT */,
          content: chat
        });
      }
    } else {
      this.globalChat.push(chat);
      this.broadcast({
        type: "chat" /* CHAT */,
        content: chat
      });
    }
  }
  handleFillBots(username) {
    if (this.game.state === "lobby" /* LOBBY */ && this.queue.includes(username)) {
      console.log("Starting game with bots...");
      this.startGameWithBots();
    }
  }
  async handleCommand(ws, command, username) {
    switch (command.command) {
      case "roll_dice" /* ROLL_DICE */:
        if (this.game.state !== "dice" /* DICE */ || this.game.currentPlayer?.username !== username) return;
        this.stopTurnTimer();
        this.game.dice = 0;
        this.broadcastState();
        this.game.rollDice();
        await delay(1e3);
        this.broadcastState();
        if (this.game.getRandomValidPiece() === void 0) {
          await delay(1e3);
          this.game.nextRoll();
          this.broadcastState();
          await this.handleTurnCycle();
        }
        break;
      case "choose_piece" /* CHOOSE_PIECE */:
        const data = command.data;
        const piece = this.game.board.pieces.find((p) => p.id === data.id);
        if (!piece || !this.game.isPieceValidChoice(piece)) {
          return;
        }
        this.stopTurnTimer();
        this.game.choosePiece(piece);
        this.broadcast({
          type: "choose_piece" /* CHOOSE_PIECE */,
          content: data
        });
        this.broadcastState();
        if (!await this.checkEnd()) {
          await this.handleTurnCycle();
        }
        break;
      case "enqueue" /* ENQUEUE */:
        if (this.game.state !== "lobby" /* LOBBY */) {
          const botPlayer = this.game.players.find((p) => p.controller === "ai" /* AI */);
          if (botPlayer) {
            botPlayer.controller = "human" /* HUMAN */;
            botPlayer.username = username;
            this.spectators = this.spectators.filter((s) => s !== username);
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
          this.spectators = this.spectators.filter((n) => n !== username);
          this.broadcast({
            type: "command" /* COMMAND */,
            content: { command: "enqueue" /* ENQUEUE */, data: username }
          });
          this.checkLobbyStart();
        }
        break;
      case "dequeue" /* DEQUEUE */:
        if (!this.spectators.includes(username)) {
          this.spectators.push(username);
          this.queue = this.queue.filter((n) => n !== username);
          this.broadcast({
            type: "command" /* COMMAND */,
            content: { command: "dequeue" /* DEQUEUE */, data: username }
          });
        }
        break;
    }
  }
  async checkEnd() {
    const finished = this.game.checkEnd();
    if (finished) {
      this.stopTurnTimer();
      this.broadcastState();
      await delay(2500);
      this.game.players.forEach((p) => {
        if (p.controller === "human" /* HUMAN */) {
          if (!this.spectators.includes(p.username)) {
            this.spectators.push(p.username);
          }
        }
      });
      let multiplier = 1;
      for (const winner of this.game.winners) {
        if (winner.controller === "human" /* HUMAN */) {
          await incrementPoints(winner.username, multiplier * 100);
          multiplier /= 2;
        }
      }
      this.game.reset();
      this.broadcast(this.createFullSyncMessage());
      return true;
    }
    return false;
  }
  checkLobbyStart() {
    if (this.queue.length >= 4 && this.game.state === "lobby" /* LOBBY */) {
      console.log("Queue full, starting game...");
      this.startGame();
    }
  }
  addFromQueue() {
    const player = this.queue.reverse().pop();
    this.queue.reverse();
    if (!player) {
      throw Error("Queue is empty");
    }
    this.game.addPlayer(player, "human" /* HUMAN */);
  }
  addBot() {
    try {
      this.game.addPlayer("BOT", "ai" /* AI */);
    } catch (error) {
      console.log("Could not add BOT: ", error);
    }
  }
  startGameWithBots() {
    this.game.reset();
    console.log("queue length", this.queue.length);
    const playerCount = this.queue.length;
    for (let i = 0; i < playerCount && i < 4; i++) {
      console.log("Add from queue once...");
      this.addFromQueue();
    }
    for (let i = playerCount; i < 4; i++) {
      this.addBot();
    }
    this.game.start();
    this.matchChat = [];
    this.broadcast(this.createFullSyncMessage());
    this.handleTurnCycle();
  }
  startGame() {
    this.game.reset();
    const playerCount = this.queue.length;
    for (let i = 0; i < playerCount && i < 4; i++) {
      this.addFromQueue();
    }
    this.game.start();
    this.broadcast(this.createFullSyncMessage());
  }
  async handleTurnCycle() {
    if (this.game.state !== "dice" /* DICE */ && this.game.state !== "piece" /* PIECE */) return;
    if (this.game.botTurn()) {
      await this.executeBotTurn();
    } else {
      this.startTurnTimer();
    }
  }
  startTurnTimer() {
    this.stopTurnTimer();
    const currentPlayer = this.game.currentPlayer;
    if (currentPlayer && currentPlayer.controller === "human" /* HUMAN */) {
      this.turnTimer = setTimeout(() => {
        this.handleInactivity(currentPlayer.username);
      }, 3e4);
    }
  }
  stopTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
  }
  handleInactivity(username) {
    const player = this.game.players.find((p) => p.username === username);
    if (!player) return;
    this.spectators.push(username);
    const nextInQueue = this.queue.shift();
    if (nextInQueue) {
      player.username = nextInQueue;
      player.controller = "human" /* HUMAN */;
      const socket = this.sockets.get(nextInQueue);
      if (socket) this.startTurnTimer();
    } else {
      player.username = "BOT";
      player.controller = "ai" /* AI */;
    }
    this.broadcast(this.createFullSyncMessage());
    if (player.controller === "ai" /* AI */) {
      this.executeBotTurn();
    }
  }
  async executeBotTurn() {
    console.log("Bot turn starting...");
    if (!this.game.currentPlayer || this.game.currentPlayer.controller !== "ai" /* AI */) return;
    await delay(1e3);
    this.game.dice = 0;
    this.broadcastState();
    this.game.rollDice();
    await delay(1e3);
    this.broadcastState();
    const piece = this.game.getRandomValidPiece();
    await delay(1e3);
    if (piece) {
      console.log(`Bot choosing piece ${piece.id}`);
      this.game.choosePiece(piece);
      this.broadcast({
        type: "choose_piece" /* CHOOSE_PIECE */,
        content: { id: piece.id }
      });
      this.broadcastState();
    } else {
      console.log("Bot cannot move, skipping turn.");
      this.game.nextRoll();
      this.broadcastState();
    }
    if (!await this.checkEnd()) {
      await delay(500);
      await this.handleTurnCycle();
    }
  }
  broadcast(message, except) {
    const payload = JSON.stringify(message);
    this.server.clients.forEach((client2) => {
      if (except && client2 === except) {
        console.log("skipping...");
        return;
      }
      if (client2.readyState === WebSocket.OPEN) {
        client2.send(payload);
      }
    });
  }
  broadcastState() {
    this.broadcast({
      type: "state_sync" /* STATE_SYNC */,
      content: this.game.asState()
    });
  }
  broadcastPlayers(message) {
    const payload = JSON.stringify(message);
    const players = this.game.players.filter((p) => p.controller !== "ai" /* AI */).map((p) => p.username);
    const clients = [...this.sockets.keys()].filter((user) => players.includes(user));
    for (const client2 of clients) {
      const socket = this.sockets.get(client2);
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(payload);
      }
    }
  }
  createFullSyncMessage(playersOnly = false) {
    let peerIds = [];
    if (playersOnly) {
      const playerNames = this.game.players.filter((p) => p.controller === "human" /* HUMAN */).map((p) => p.username);
      peerIds = playerNames.map((p) => this.sockets.get(p)?.peerId).filter((p) => p !== void 0);
    }
    return {
      type: "full_sync" /* FULL_SYNC */,
      content: {
        state: {
          currentPlayer: this.game.currentPlayer,
          dice: this.game.dice,
          state: this.game.state
        },
        queue: this.queue,
        spectators: Array.from(this.spectators),
        peers: playersOnly ? peerIds : [],
        players: this.game.players.map((player) => ({
          username: player.username,
          color: player.color,
          finished: player.finished,
          controller: player.controller
        })),
        pieces: this.game.board.pieces.map((piece) => ({
          id: piece.id,
          x: piece.tile?.x,
          z: piece.tile?.z,
          state: piece.state
        })),
        globalChat: this.globalChat,
        matchChat: playersOnly ? this.matchChat : []
      }
    };
  }
};

// src/server/server.ts
import { PeerServer } from "peer";
import cors from "cors";
var app = express();
var PORT = process.env.PORT || 3e3;
var ALLOWED_ORIGINS = [
  "http://aa.eduardo.godinho.vms.ufsc.br",
  "https://aa.eduardo.godinho.vms.ufsc.br"
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error("CORS blocked..."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
var __filename = fileURLToPath(import.meta.url);
var dirname = path2.dirname(__filename);
var publicPath = path2.join(dirname, "public");
app.use(express.static(publicPath));
async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt3.verify(token, "INE5646");
    const user = await getUserByName(decoded.username);
    if (user != null) {
      req.user = decoded;
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
app.get("/api/users", async (req, res) => {
  const users = await getUsers();
  res.json({ count: users.length, items: users });
});
app.get("/api/countries", async (req, res) => {
  const countries = await getCountries();
  res.json(countries);
});
app.get("/api/states", async (req, res) => {
  const { country } = req.query;
  const states = await getStatesOfCountry(country);
  res.json(states);
});
app.get("/api/cities", async (req, res) => {
  const { country, state } = req.query;
  const cities = await getCitiesOfState(country, state);
  res.json(cities);
});
app.post("/api/register", async (req, res) => {
  try {
    const createdUser = await createUser(req.body);
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(400).json({ error });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const token = await loginUser(req.body);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error });
  }
});
app.get("/api/user", authMiddleware, async (req, res) => {
  if (req.user !== void 0) {
    try {
      const user = await getUserByName(req.user.username);
      res.status(200).json(user);
    } catch (err) {
      res.status(401).json({ message: "User not found" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});
app.get(/(.*)/, (req, res) => {
  if (req.url.includes(".")) {
    return res.status(404).send("Arquivo n\xE3o encontrado");
  }
  res.sendFile(path2.join(publicPath, "index.html"));
});
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
var matchId = await getLatestMatchId();
new Manager({ nextId: matchId + 1, port: 3001 });
var peerServer = PeerServer({
  port: 9e3,
  path: "/webrtc",
  allow_discovery: true
});
peerServer.on("connection", (client2) => {
  console.log(`[peer] client connected: ${client2.getId()}`);
});
