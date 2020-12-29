import Game from "./game.js";
import {
  GameCreated,
  GameDraw,
  GameWon,
  PlayerAdded,
  PlayerMoved,
  PlayerRemoved
} from "./event.js";

async function main() {
  const socket = io("ws://localhost:3000");
  const game = new Game(1);

  socket.on("connect", () => {
    console.log("connected", socket.id);
  });

  const $ = el => document.getElementById(el);

  const $cells = $("tic-tac-toe").querySelectorAll("div");
  $cells.forEach(($cell, i) => {
    $cell.addEventListener("click", () => {
      socket.emit("PlayerMoved", i);
    });
  });

  const $players = $("players");
  game.update = () => {
    $players.innerText =
      game.currentPlayer() === socket.id ? "Your turn" : "Waiting for opponent";
    game.cells.forEach((cell, i) => {
      $cells[i].innerText = cell;
    });
  };

  socket.on("GameCreated", event => {
    const e = new GameCreated(event.aggregateId, event.aggregateVersion, event);
    game.apply(e);
    game.update();
  });

  socket.on("GameDraw", event => {
    const e = new GameDraw(event.aggregateId, event.aggregateVersion);
    game.apply(e);
    game.update();
    window.alert("Game Draw");
  });

  socket.on("GameWon", event => {
    const e = new GameWon(
      event.aggregateId,
      event.aggregateVersion,
      event.playerId
    );
    game.apply(e);
    game.update();
    const msg = event.playerId === socket.id ? "You won" : "You lost";
    window.alert(msg);
  });

  socket.on("PlayerMoved", event => {
    const e = new PlayerMoved(event.aggregateId, event.aggregateVersion, event);
    game.apply(e);
    game.update();
  });

  socket.on("PlayerAdded", event => {
    const e = new PlayerAdded(
      event.aggregateId,
      event.aggregateVersion,
      event.players
    );
    game.apply(e);
    game.update();
  });
  socket.on("PlayerRemoved", event => {
    const e = new PlayerRemoved(
      event.aggregateId,
      event.aggregateVersion,
      event.players
    );
    game.apply(e);
    game.update();
  });
}
main().catch(console.error);
