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

export function checkWinner(cells) {
  for (let [a, b, c] of COMBINATIONS) {
    const line = cells[a] + cells[b] + cells[c];
    if (line === "xxx" || line === "ooo") {
      return true;
    }
  }
  return false;
}
