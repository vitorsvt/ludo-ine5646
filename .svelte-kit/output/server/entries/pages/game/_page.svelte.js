import { s as store_get, a as attr_class, e as ensure_array_like, u as unsubscribe_stores, b as attr_style, c as stringify } from "../../../chunks/index2.js";
import { t as tokenStore, u as userStore } from "../../../chunks/Auth.svelte.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import { U as escape_html } from "../../../chunks/utils2.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import "vite-plugin-node-polyfills/shims/global";
import { a as attr, c as clsx } from "../../../chunks/attributes.js";
import { g as get } from "../../../chunks/index.js";
class Piece {
  static idCounter = 0;
  id;
  color;
  tile;
  state = "waiting";
  constructor(color) {
    this.id = ++Piece.idCounter;
    this.color = color;
    this.tile = null;
  }
  move(count) {
    if (this.tile === null) {
      throw Error("Piece is not in a tile");
    }
    if (this.state === "waiting" && count === 6) {
      this.state = "playing";
      count = 1;
    }
    let backwards = false;
    while (count > 0) {
      if (!backwards) {
        if (this.tile.next.length === 2) {
          let home = this.tile.next.find(
            (t) => t.type === "home"
            /* HOME */
          );
          let other = this.tile.next.find(
            (t) => t.type !== "home"
            /* HOME */
          );
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
      this.state = "finished";
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
}
class Tile {
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
    if (type === "home") {
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
}
class Board {
  static colors = [
    "orange",
    "blue",
    "red",
    "green"
    /* GREEN */
  ];
  tiles;
  pieces;
  constructor() {
    this.tiles = Board.createTileGraph();
    this.pieces = [];
    Piece.idCounter = 0;
    for (const color of Board.colors) {
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
      (t) => t.color === piece.color && t.type === "spawn" && t.pieces.length === 0
    );
    if (tile) {
      piece.state = "waiting";
      tile.add(piece);
    } else {
      throw Error("Erro ao posicionar peça nas posições iniciais");
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
    Board.colors.forEach((color, i) => {
      for (let pos = -2; pos >= -7; pos--) {
        const [x2, z2] = Board.rotateCoordinates([-1, pos], i);
        current = new Tile(
          x2,
          z2,
          "neutral"
          /* NEUTRAL */
        );
        tiles.push(current);
        if (previous) {
          previous.next.push(current);
        }
        previous = current;
      }
      const [x, z] = Board.rotateCoordinates([0, -7], i);
      const branch = new Tile(
        x,
        z,
        "branch"
        /* BRANCH */
      );
      tiles.push(branch);
      previous.next.push(branch);
      previous = branch;
      for (let pos = -6; pos <= -1; pos++) {
        const [x2, z2] = Board.rotateCoordinates([0, pos], i);
        current = new Tile(x2, z2, "home", color);
        tiles.push(current);
        previous.next.push(current);
        current.prev.push(previous);
        previous = current;
      }
      previous = branch;
      for (let pos = -7; pos <= -2; pos++) {
        const [x2, z2] = Board.rotateCoordinates([1, pos], i);
        let current2;
        if (pos === -6) {
          current2 = new Tile(x2, z2, "start", color);
          for (const [x3, z3] of [
            [3.5, -4.5],
            [4.5, -5.5],
            [5.5, -4.5],
            [4.5, -3.5]
          ]) {
            const [sx, sz] = Board.rotateCoordinates([x3, z3], i);
            const spawn = new Tile(sx, sz, "spawn", color);
            spawn.next.push(current2);
            tiles.push(spawn);
          }
        } else {
          current2 = new Tile(
            x2,
            z2,
            "neutral"
            /* NEUTRAL */
          );
        }
        tiles.push(current2);
        previous.next.push(current2);
        previous = current2;
      }
    });
    tiles[tiles.length - 1].next.push(tiles[0]);
    return tiles;
  }
}
var PlayerController = /* @__PURE__ */ ((PlayerController2) => {
  PlayerController2["HUMAN"] = "human";
  PlayerController2["AI"] = "ai";
  return PlayerController2;
})(PlayerController || {});
var GameState = /* @__PURE__ */ ((GameState2) => {
  GameState2["LOBBY"] = "lobby";
  GameState2["DICE"] = "dice";
  GameState2["PIECE"] = "piece";
  GameState2["END"] = "end";
  return GameState2;
})(GameState || {});
class Game {
  static idCounter = 1;
  id;
  state = "lobby";
  board;
  dice = 0;
  players;
  currentPlayer;
  winners;
  constructor() {
    this.id = Game.idCounter++;
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
          (p) => p.color === player.color && p.state === "finished"
          /* FINISHED */
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
      this.state = "end";
    }
    return finished;
  }
  rollDice() {
    if (this.state !== "dice" || this.currentPlayer === void 0) {
      throw Error("Can't throw the dice right now");
    }
    const color = this.currentPlayer.color;
    const waitingPieces = this.board.pieces.filter(
      (p) => p.state === "waiting"
      /* WAITING */
    );
    const colorWaitingPieces = waitingPieces.filter((p) => p.color === color);
    this.state = "piece";
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
    this.state = "piece";
  }
  isPieceValidChoice(piece) {
    if (this.state !== "piece") {
      return { valid: false, reason: "Can't choose piece right now" };
    }
    if (this.currentPlayer === void 0) {
      return { valid: false, reason: "No player is currently active" };
    }
    if (piece.color !== this.currentPlayer.color) {
      return { valid: false, reason: "Piece not of current player color" };
    }
    if (piece.state === "finished") {
      return { valid: false, reason: "Can't move a finished piece" };
    }
    if (this.dice !== 6 && piece.state === "waiting") {
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
        case "orange":
          return "blue";
        case "blue":
          return "red";
        case "red":
          return "green";
        case "green":
          return "orange";
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
    this.state = "dice";
  }
  reset() {
    this.id = Game.idCounter++;
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
    this.state = "dice";
  }
  botTurn() {
    return (this.state === "dice" || this.state === "piece") && this.currentPlayer !== void 0 && this.currentPlayer.controller === "ai" && this.currentPlayer.finished === false;
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
}
new Game();
let dice = 3;
function getDice() {
  return dice;
}
let currentPlayer = void 0;
function getCurrentPlayer() {
  return currentPlayer;
}
let gameState = GameState.DICE;
function getGameState() {
  return gameState;
}
let players = {
  active: [],
  queue: [],
  spectators: [],
  humans() {
    return this.active.filter((p) => p.controller === PlayerController.HUMAN);
  },
  isPlaying(player) {
    if (player === null) return false;
    return this.humans().map((p) => p.username).includes(player);
  }
};
var MessageType = /* @__PURE__ */ ((MessageType2) => {
  MessageType2["CHAT"] = "chat";
  MessageType2["COMMAND"] = "command";
  MessageType2["FULL_SYNC"] = "full_sync";
  MessageType2["PIECE_SYNC"] = "piece_sync";
  MessageType2["PLAYER_SYNC"] = "player_sync";
  MessageType2["STATE_SYNC"] = "state_sync";
  MessageType2["CHOOSE_PIECE"] = "choose_piece";
  MessageType2["GREET"] = "greet";
  MessageType2["FILL_BOTS"] = "fill_bots";
  MessageType2["VIDEO_READY"] = "video_ready";
  MessageType2["VIDEO_SYNC"] = "video_sync";
  MessageType2["START_RECORDING"] = "start_recording";
  MessageType2["STOP_RECORDING"] = "stop_recording";
  return MessageType2;
})(MessageType || {});
class VideoManager {
  localStream = null;
  remoteStreams = [];
  peer = null;
  calls = /* @__PURE__ */ new Map();
  initializing = false;
  async init() {
    if (this.initializing || this.peer) return;
    this.initializing = true;
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (e) {
      console.error("Erro da câmera:", e);
      return;
    }
    const peerLib = await import("peerjs");
    this.peer = new peerLib.Peer("", {
      host: window.location.hostname,
      port: window.location.port ? Number(window.location.port) : window.location.protocol === "https:" ? 443 : 80,
      path: "/webrtc",
      secure: window.location.protocol === "https:"
    });
    this.peer.on("open", (myPeerId) => {
      console.log("[video] Conectado com id:", myPeerId);
      send(JSON.stringify({
        type: MessageType.VIDEO_READY,
        token: get(tokenStore),
        content: myPeerId
      }));
    });
    this.peer.on("call", (call) => {
      console.log("[video] Recebendo chamada de:", call.peer);
      if (!this.localStream) return;
      call.answer(this.localStream);
      this.handleCallEvents(call);
    });
  }
  sync(onlinePeerIds) {
    console.log(onlinePeerIds);
    if (!this.peer || !this.localStream) return;
    const myId = this.peer.id;
    for (const targetId of onlinePeerIds) {
      if (targetId === myId) continue;
      if (this.calls.has(targetId)) continue;
      console.log("[video] Iniciando chamada com:", targetId);
      const call = this.peer.call(targetId, this.localStream);
      this.handleCallEvents(call);
    }
    for (const [connectedId, call] of this.calls) {
      if (!onlinePeerIds.includes(connectedId)) {
        console.log("[video] Encerrando chamada com:", connectedId);
        call.close();
      }
    }
    console.log(this.calls);
  }
  handleCallEvents(call) {
    console.log(call.peer);
    this.calls.set(call.peer, call);
    call.on("stream", (stream) => {
      if (stream.getVideoTracks().length === 0) return;
      this.remoteStreams = this.remoteStreams.filter((r) => r.peerId !== call.peer);
      this.remoteStreams.push({ peerId: call.peer, stream });
    });
    const cleanup = () => {
      this.calls.delete(call.peer);
      this.remoteStreams = this.remoteStreams.filter((r) => r.peerId !== call.peer);
    };
    call.on("close", cleanup);
    call.on("error", cleanup);
  }
}
const video = new VideoManager();
let messages = { global: [], match: [] };
function send(data) {
  {
    throw Error("Socket não está conectado");
  }
}
function Dice($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let serverDice = getDice();
    let currentPlayer2 = getCurrentPlayer();
    let gameState2 = getGameState();
    let isRolling = serverDice === 0;
    let diceDisplay = getDice();
    let isMyTurn = currentPlayer2?.username === store_get($$store_subs ??= {}, "$userStore", userStore) && gameState2 === GameState.DICE;
    if (getGameState() !== GameState.LOBBY) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button${attr_class("face svelte-1c5zmio", void 0, { "shaking": isRolling, "disabled": !isMyTurn })}${attr("disabled", !isMyTurn, true)} title="Roll the dice"><!--[-->`);
      const each_array = ensure_array_like({ length: diceDisplay });
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        $$renderer2.push(`<span class="pip svelte-1c5zmio"></span>`);
      }
      $$renderer2.push(`<!--]--></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Chat($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let globalChatValue = "";
    let matchChatValue = "";
    let playing = players.active.find((p) => p.username === store_get($$store_subs ??= {}, "$userStore", userStore)) !== void 0;
    $$renderer2.push(`<section class="chat svelte-1oj54e7"><div class="svelte-1oj54e7"><h2>Global</h2> <ul class="svelte-1oj54e7"><!--[-->`);
    const each_array = ensure_array_like(messages.global);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let message = each_array[$$index];
      $$renderer2.push(`<li class="svelte-1oj54e7"><figure class="sender svelte-1oj54e7"><img src="/avatar.png" alt="avatar" class="svelte-1oj54e7"/> <figcaption class="svelte-1oj54e7">${escape_html(message.author)}</figcaption></figure> <blockquote><p>${escape_html(message.body)}</p></blockquote></li>`);
    }
    $$renderer2.push(`<!--]--></ul> <form class="svelte-1oj54e7"><input${attr("value", globalChatValue)} type="text" class="svelte-1oj54e7"/> <button type="submit">Enviar</button></form></div> `);
    if (playing) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="svelte-1oj54e7"><h2>Partida</h2> <ul class="svelte-1oj54e7"><!--[-->`);
      const each_array_1 = ensure_array_like(messages.match);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let message = each_array_1[$$index_1];
        $$renderer2.push(`<li class="svelte-1oj54e7"><figure class="svelte-1oj54e7"><img src="/avatar.png" alt="avatar" class="svelte-1oj54e7"/> <figcaption class="svelte-1oj54e7">${escape_html(message.author)}</figcaption></figure> <blockquote><p>${escape_html(message.body)}</p></blockquote></li>`);
      }
      $$renderer2.push(`<!--]--></ul> <form class="svelte-1oj54e7"><input${attr("value", matchChatValue)} type="text" class="svelte-1oj54e7"/> <button type="submit">Enviar</button></form></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Queue($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let enqueued = players.queue.includes(store_get($$store_subs ??= {}, "$userStore", userStore) === null ? "" : store_get($$store_subs ??= {}, "$userStore", userStore));
    let playing = players.active.find((p) => p.username === store_get($$store_subs ??= {}, "$userStore", userStore)) !== void 0;
    $$renderer2.push(`<section class="svelte-1c3hn62">`);
    if (enqueued && getGameState() === GameState.LOBBY) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="svelte-1c3hn62"><button class="svelte-1c3hn62">Iniciar com BOTS</button> <button class="svelte-1c3hn62">Sair da fila</button></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (!enqueued && !playing) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button>Entrar na fila</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <h2>Partida</h2> <ul class="svelte-1c3hn62">`);
    if (players.active.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<li class="svelte-1c3hn62">Ninguém jogando...</li>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(players.active);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let player = each_array[$$index];
        $$renderer2.push(`<li class="svelte-1c3hn62"><figure class="svelte-1c3hn62"><img src="/avatar.png" alt="avatar" class="svelte-1c3hn62"/> <figcaption class="svelte-1c3hn62">`);
        if (player.controller === PlayerController.HUMAN) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<a${attr("href", `/users?name=${stringify(player.username)}`)}${attr_style(`color: ${stringify(player.color)}`)}>${escape_html(player.username)}</a>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<span${attr_style(`color: ${stringify(player.color)}`)}>${escape_html(player.username)}</span>`);
        }
        $$renderer2.push(`<!--]--></figcaption></figure></li>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></ul> <h2>Fila</h2> <ul class="svelte-1c3hn62">`);
    if (players.queue.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<li class="svelte-1c3hn62">Nenhum jogador na fila...</li>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(players.queue);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let user = each_array_1[$$index_1];
        $$renderer2.push(`<li class="svelte-1c3hn62"><figure class="svelte-1c3hn62"><img src="/avatar.png" alt="avatar" class="svelte-1c3hn62"/> <figcaption class="svelte-1c3hn62"><a${attr("href", `/users?name=${stringify(user)}`)}>${escape_html(user)}</a></figcaption></figure></li>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></ul> <h2>Espectadores</h2> <ul class="svelte-1c3hn62">`);
    if (players.spectators.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<li class="svelte-1c3hn62">Nenhum jogador como espectador...</li>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_2 = ensure_array_like(players.spectators);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let user = each_array_2[$$index_2];
        $$renderer2.push(`<li class="svelte-1c3hn62"><figure class="svelte-1c3hn62"><img src="/avatar.png" alt="avatar" class="svelte-1c3hn62"/> <figcaption class="svelte-1c3hn62"><a${attr("href", `/users?name=${stringify(user)}`)}>${escape_html(user)}</a></figcaption></figure></li>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></ul></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Capture($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let videos = [];
    $$renderer2.push(`<section class="options svelte-4rl9pb">`);
    if (players.isPlaying(store_get($$store_subs ??= {}, "$userStore", userStore))) {
      $$renderer2.push("<!--[-->");
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<button class="svelte-4rl9pb">Iniciar gravação</button>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <h2>Gravações</h2> <ul>`);
    if (videos.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(videos);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let video2 = each_array[$$index];
        $$renderer2.push(`<li><a${attr("href", video2.location)}>Partida ${escape_html(video2.matchId)}</a></li>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<li>Nenhum vídeo salvo ainda...</li>`);
    }
    $$renderer2.push(`<!--]--></ul></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Ranking($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let users = [];
    $$renderer2.push(`<section class="svelte-15juf2f"><h2>Ranking de pontuação</h2> <ul><!--[-->`);
    const each_array = ensure_array_like(users);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let user = each_array[$$index];
      $$renderer2.push(`<li>${escape_html(user.username)} - ${escape_html(user.score)} pontos</li>`);
    }
    $$renderer2.push(`<!--]--></ul></section>`);
  });
}
function Tabs($$renderer) {
  var $$store_subs;
  let items = [
    { label: "Jogadores", component: Queue },
    { label: "Chat", component: Chat },
    { label: "Gravação", component: Capture },
    { label: "Ranking", component: Ranking }
  ];
  let activeTabValue = 0;
  $$renderer.push(`<aside class="svelte-sgunbx"><nav class="svelte-sgunbx"><span class="svelte-sgunbx">LUDO</span> <ul class="svelte-sgunbx"><li class="svelte-sgunbx">${escape_html(store_get($$store_subs ??= {}, "$userStore", userStore))}</li> <li class="svelte-sgunbx"><a href="/">Página inicial</a></li></ul></nav> <ul class="tabs svelte-sgunbx"><!--[-->`);
  const each_array = ensure_array_like(items);
  for (let i = 0, $$length = each_array.length; i < $$length; i++) {
    let item = each_array[i];
    $$renderer.push(`<li${attr_class(clsx(activeTabValue === i ? "active" : ""), "svelte-sgunbx")}><button class="svelte-sgunbx">${escape_html(item.label)}</button></li>`);
  }
  $$renderer.push(`<!--]--></ul> <!--[-->`);
  const each_array_1 = ensure_array_like(items);
  for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
    let item = each_array_1[i];
    if (activeTabValue == i) {
      $$renderer.push("<!--[-->");
      $$renderer.push(`<div class="svelte-sgunbx"><!---->`);
      item.component?.($$renderer, {});
      $$renderer.push(`<!----></div>`);
    } else {
      $$renderer.push("<!--[!-->");
    }
    $$renderer.push(`<!--]-->`);
  }
  $$renderer.push(`<!--]--></aside>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
function Webcam($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="cameras svelte-14cx0o6">`);
    if (video.localStream) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="video-box my-camera svelte-14cx0o6"><video autoplay muted playsinline class="svelte-14cx0o6"></video> <span class="svelte-14cx0o6">Eu</span></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array = ensure_array_like(video.remoteStreams);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      each_array[$$index];
      $$renderer2.push(`<div class="video-box svelte-14cx0o6"><video autoplay playsinline class="svelte-14cx0o6"></video></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let display = /* @__PURE__ */ (() => {
      return { color: "black", message: "carregando..." };
    })();
    $$renderer2.push(`<main class="svelte-s4ovif"><div class="container svelte-s4ovif"><canvas class="svelte-s4ovif"></canvas> <p${attr_style(`background-color: ${stringify(display.color)}`)} class="svelte-s4ovif">${escape_html(display.message)}</p> `);
    Dice($$renderer2);
    $$renderer2.push(`<!----> `);
    Webcam($$renderer2);
    $$renderer2.push(`<!----></div> `);
    Tabs($$renderer2);
    $$renderer2.push(`<!----></main>`);
  });
}
export {
  _page as default
};
