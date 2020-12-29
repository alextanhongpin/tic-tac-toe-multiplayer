import EventEmitter from "events";
import { checkWinner } from "./common/tic-tac-toe.js";

const initialState = () => ({
  cells: Array(9).fill(null),
  round: 0
});

class Board extends EventEmitter {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      labels: "xo",
      ...initialState()
    };
  }

  reset() {
    this.state = {
      ...this.state,
      ...initialState()
    };
    this.emit("play");
  }

  serialize(currPlayerId) {
    const playerIdx = this.state.players.findIndex(
      player => player.id === currPlayerId
    );
    return {
      ...this.state,
      playerIdx,
      ready: this.currentPlayer().id === currPlayerId,
      win: checkWinner(this.state.cells),
      draw: this.lastRound
    };
  }

  move(cellId) {
    if (!this.ready) return;
    const { cells } = this.state;

    if (cells[cellId]) {
      return;
    }

    cells[cellId] = this.currentLabel();
    this.state.round++;
    this.emit("play");
  }

  addPlayer(player) {
    // There's already an ongoing game.
    if (this.ready) {
      this.emit("error", new Error("Room full"));
      return;
    }
    this.state.players.push(player);
    this.emit("play");
  }

  get ready() {
    return this.state.players.length === 2;
  }

  get lastRound() {
    return this.state.round === 9;
  }

  currentPlayer() {
    const { round, players } = this.state;
    const player = players[round % players.length];
    return player;
  }

  currentLabel() {
    const { labels, round } = this.state;
    return labels[round % labels.length];
  }
}

export default Board;
