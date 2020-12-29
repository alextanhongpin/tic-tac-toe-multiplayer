class Board {
  constructor(dom) {
    this.state = {
      round: 0,
      players: [],
      cells: [],
      playerIdx: -1,
      ready: false,
      win: false,
      draw: false
    };

    this.$cells = dom.querySelectorAll("div");
    this.$cells.forEach((cell, i) => {
      cell.addEventListener("click", evt => {
        if (!this.state.ready) return;
        this.onMove(i);
      });
    });
  }

  deserialize(state) {
    this.state = state;
    const { ready, win, draw } = this.state;
    this.draw();
    if (win) {
      if (ready) {
        window.alert("You lose");
      } else {
        window.alert("You win");
      }
      return true;
    }
    if (draw) {
      window.alert("Game draw");
      return true;
    }
  }

  draw() {
    const { playerIdx, players, labels, ready, cells } = this.state;
    this.$cells.forEach((cell, i) => {
      cell.innerText = cells[i];
    });
    const player = players[playerIdx];
    const messages = players.map(
      (player, idx) =>
        `${idx === playerIdx ? "You" : player.name} plays ${labels[idx]}`
    );
    if (players.length === 1) {
      messages.push("Waiting for opponent");
    } else {
      messages.push(ready ? "Your turn" : "Waiting for opponent");
    }
    document.getElementById("players").innerText = messages.join("\n");
  }
}

export default Board;
