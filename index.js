import WebSocket from "ws";
import express from "express";
import * as uuid from "uuid";

import Board from "./board.js";
import Player from "./common/player.js";
import { makeMessage } from "./common/message.js";

async function main() {
  const PORT = 3000;
  const app = express();

  app.use(express.static("public"));
  app.use(express.static("common")); // Shared logic between client and server is placed in common/.

  const ws = new WebSocket.Server({ noServer: true });
  const server = app.listen(PORT, () => {
    console.log("listening on port *:%d, press ctrl + c to cancel", PORT);
  });

  server.on("upgrade", (request, socket, head) => {
    ws.handleUpgrade(request, socket, head, socket => {
      ws.emit("connection", socket, request);
    });
  });

  // Single game (no rooms).
  const board = new Board();

  ws.on("connection", function connection(socket) {
    const playerId = uuid.v4();

    board.on("error", sendError);
    board.on("play", () => {
      socket.send(makeMessage("play", board.serialize(playerId)));
    });

    function sendError(error) {
      socket.send(makeMessage("error", error.message));
    }

    socket.on("message", function incoming(raw) {
      const msg = JSON.parse(raw);
      if (!msg) return;

      try {
        const { action, data } = msg;
        // There are only two main messages from the client - when a player join and when a player move.
        // The game state is computed on the server side and returned to the client.
        switch (action) {
          case "join":
            const player = new Player(playerId, data.username);
            board.addPlayer(player);
            break;
          case "move":
            board.move(data.cellId);
            break;
          case "new":
            board.reset();
            break;
          case "quit":
            socket.send(makeMessage("quit"));
            break;
          default:
        }
      } catch (error) {
        sendError(error);
      }
    });
  });
}

main().catch(console.error);
