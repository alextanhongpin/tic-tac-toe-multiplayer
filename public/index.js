import Board from "./board.js";
import { makeMessage } from "./message.js";

let username = "";
const socket = new WebSocket("ws://localhost:3000");
const board = new Board(document.getElementById("tic-tac-toe"));

board.onMove = function(cellId) {
  socket.send(
    makeMessage("move", {
      cellId
    })
  );
};

socket.onmessage = function(event) {
  const msg = JSON.parse(event.data);
  switch (msg.action) {
    case "play":
      const end = board.deserialize(msg.data);
      if (end) {
        const newGame = window.confirm("New game?");
        console.log({ newGame });
        newGame
          ? socket.send(makeMessage("new"))
          : socket.send(makeMessage("quit"));
      }
      break;
    case "error":
      window.alert(msg.data);
      break;
    case "quit":
      window.alert("Player disconnected");
      socket.close();
      break;
    default:
  }
};

function promptUsername() {
  while (!username) {
    username = window.prompt("Enter username", "");
  }
  document.getElementById("players").innerText = `${username} (you)`;
}

socket.onopen = function(event) {
  promptUsername();
  socket.send(makeMessage("join", { username }));
};
