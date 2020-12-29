import {
  GameWon,
  GameDraw,
  GameCreated,
  PlayerAdded,
  PlayerRemoved,
  PlayerMoved
} from "./event.js";
import Entity from "./entity.js";

const COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export function resetGame(game) {
  const event = new GameCreated(game.aggregateId, 1, {
    round: 0,
    players: [],
    labels: "xo",
    cells: Array(9).fill(null)
  });
  game.aggregateVersion = 0;
  game.events = [];
  game.raise(event);
}

export function createGame(aggregateId) {
  const event = new GameCreated(aggregateId, 1, {
    round: 0,
    players: [],
    labels: "xo",
    cells: Array(9).fill(null)
  });
  const game = new Game(aggregateId);
  game.raise(event);
  return game;
}

export default class Game extends Entity {
  round = 0;
  players = [];
  labels = "xo";
  cells = Array(9).fill(null);
  end = false;

  apply(event) {
    if (event.aggregateVersion != this.aggregateVersion + 1) return;
    this.aggregateId = event.aggregateId;
    this.aggregateVersion = event.aggregateVersion;

    switch (event.constructor.name) {
      case GameCreated.name:
        this.round = event.round;
        this.players = event.players;
        this.labels = event.labels;
        this.cells = event.cells;
        this.end = false;
        break;
      case GameWon.name:
        this.end = true;
        break;
      case GameDraw.name:
        this.end = true;
        break;
      case PlayerMoved.name:
        this.cells[event.position] = event.label;
        this.round = event.round;
        break;
      case PlayerAdded.name:
      case PlayerRemoved.name:
        // To avoid undeterministic behaviour, show the final state instead of
        // performing push/filter here.
        this.players = event.players;
        break;
      default:
        throw new Error(
          `${event.constructor.name} not implemented: ${JSON.stringify(event)}`
        );
    }
  }

  move(position, playerId) {
    if (playerId !== this.currentPlayer()) {
      return;
    }
    if (this.end || this.cells[position] || !this.checkCapacityExceeded()) {
      return;
    }

    const label = this.currentLabel(); // `x` or `o`
    const playerMovedEvent = new PlayerMoved(
      this.aggregateId,
      this.aggregateVersion + 1,
      {
        position,
        label,
        round: this.round + 1
      }
    );
    this.raise(playerMovedEvent);

    if (this.checkWin()) {
      const gameWonEvent = new GameWon(
        this.aggregateId,
        this.aggregateVersion + 1,
        playerId
      );
      this.raise(gameWonEvent);
      return;
    }

    if (this.checkDraw()) {
      const gameDrawEvent = new GameDraw(
        this.aggregateId,
        this.aggregateVersion + 1
      );
      this.raise(gameDrawEvent);
      return;
    }
  }

  addPlayer(playerId) {
    if (this.checkCapacityExceeded()) return;

    const event = new PlayerAdded(
      this.aggregateId,
      this.aggregateVersion + 1,
      this.players.concat(playerId)
    );
    this.raise(event);
  }

  removePlayer(playerId) {
    const event = new PlayerRemoved(
      this.aggregateId,
      this.aggregateVersion + 1,
      this.players.filter(prevPlayerId => prevPlayerId !== playerId)
    );
    this.raise(event);
  }

  reset() {
    const event = new GameReset(this.aggregateId, this.aggregateVersion + 1);
    this.raise(event);
  }

  currentPlayer() {
    const playerId = this.players[this.round % this.players.length];
    return playerId;
  }

  currentLabel() {
    const label = this.labels[this.round % this.labels.length];
    return label;
  }

  checkWin() {
    for (let [a, b, c] of COMBINATIONS) {
      const line = this.cells[a] + this.cells[b] + this.cells[c];
      if (line === "xxx" || line === "ooo") {
        return true;
      }
    }
    return false;
  }

  checkDraw() {
    return !this.checkWin() && this.round === 9;
  }

  checkCapacityExceeded() {
    return this.players.length === 2;
  }
  checkHasPlayers() {
    return this.players.length > 0;
  }
}
