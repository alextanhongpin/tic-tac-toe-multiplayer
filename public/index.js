import Game from "./game.js";
import { mapEvent } from "./event.js";

async function main() {
  const socket = io("ws://localhost:3000");
  const game = new Game(1);

  socket.on("connect", () => {
    console.log("connected", socket.id);
  });

  socket.on("handshake", events => {
    for (let event of events) {
      game.apply(mapEvent(event));
    }
    game.update();
  });

  const $ = el => document.getElementById(el);

  const $cells = $("tic-tac-toe").querySelectorAll("div");
  $cells.forEach(($cell, i) => {
    $cell.addEventListener("click", () => {
      socket.emit("PlayerMoved", i);
    });
  });

  $("new").addEventListener("click", () => {
    socket.emit("GameReset");
  });

  const $players = $("players");
  game.update = () => {
    $players.innerText =
      game.currentPlayer() === socket.id ? "Your turn" : "Waiting for opponent";
    game.cells.forEach((cell, i) => {
      $cells[i].innerText = cell;
    });
  };

  socket.on("GameReset", event => {
    game.apply(mapEvent(event));
    game.update();
  });

  socket.on("GameCreated", event => {
    game.apply(mapEvent(event));
    game.update();
  });

  socket.on("GameDraw", event => {
    game.apply(mapEvent(event));
    game.update();
    window.alert("Game Draw");
  });

  socket.on("GameWon", event => {
    game.apply(mapEvent(event));
    game.update();
    const msg = event.playerId === socket.id ? "You won" : "You lost";
    window.alert(msg);
  });

  socket.on("PlayerMoved", event => {
    game.apply(mapEvent(event));
    game.update();
  });

  socket.on("PlayerAdded", event => {
    game.apply(mapEvent(event));
    game.update();
  });

  socket.on("PlayerRemoved", event => {
    game.apply(mapEvent(event));
    game.update();
  });
}
main().catch(console.error);
