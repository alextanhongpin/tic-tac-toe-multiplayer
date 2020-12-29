import express from "express";
import http from "http";
import { Server as Socket } from "socket.io";
import { createGame, resetGame } from "./common/game.js";

async function main() {
  let id = 0;
  let game = createGame(++id);

  const app = express();
  app.use(express.static("public"));
  app.use(express.static("common")); // Shared logic between client and server is placed in common/.

  const server = http.createServer(app);
  const io = new Socket(server);

  io.on("connection", socket => {
    const userId = socket.id;

    for (let event of game.events) {
      socket.emit(event.constructor.name, event);
    }
    game.addPlayer(userId);

    socket.on("PlayerMoved", position => {
      game.move(position, userId);
    });

    console.log("user connected", userId);
    socket.on("disconnect", () => {
      game.removePlayer(userId);
      if (!game.checkHasPlayers()) {
        resetGame(game);
      }
      console.log("user disconnected", userId);
    });
  });

  server.listen(3000, () => {
    console.log("listening on port *:%d, press ctrl + c to cancel", 3000);
  });

  game.on("GameDraw", event => io.emit("GameDraw", event));
  game.on("GameWon", event => io.emit("GameWon", event));
  game.on("PlayerAdded", event => io.emit("PlayerAdded", event));
  game.on("PlayerMoved", event => io.emit("PlayerMoved", event));
  game.on("GameReset", event => io.emit("GameReset", event));
}

main().catch(console.error);
