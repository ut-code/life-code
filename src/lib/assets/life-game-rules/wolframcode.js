"use strict";

let generationFigure = 0;
let currentRow = 0;

//盤面の大きさ
const boardSize = 201; //奇数に設定する
const cellSize = 450 / boardSize;
const centerline = (boardSize - 1) / 2;

//セルの色
const aliveCellColor = "black";
const deadCellColor = "white";

//セルの生存条件(誕生条件)
//今回は0から7までのパターンのうち 4, 3, 2, 1 が生存条件なので、2^4 + 2^3 + 2^2 + 2^1 = 30 から ルール30と呼ばれる。
//他にルール184(7,5,4,3)や、ルール110(6,5,3,2,1)、ルール90(6,4,3,1)などが有名なので試してみましょう

// 生存パターン(2進法)を整数(10進法)で定義
const aliveRules = new Set([4, 3, 2, 1]);
function isNextAlive(left, center, right) {
  // ビットシフトで3つの数値を1つの整数にする
  // 例: 1, 0, 0 => (1<<2) | (0<<1) | 0 => 4
  const pattern = (left << 2) | (center << 1) | right;
  // セットに含まれているか確認（1 or 0 を返す）
  return aliveRules.has(pattern) ? 1 : 0;
}

function getStyle(cell) {
  if (cell === 0) return deadCellColor;
  return aliveCellColor;
}

let board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => 0));
board[0][centerline] = 1; //最上段中央のセルだけ生きたセルに変更
const table = document.getElementById("game-board");

function renderBoard() {
  document.body.style.display = "flex";
  document.body.style.justifyContent = "center";
  document.body.style.alignItems = "center";
  document.body.style.minHeight = "100vh";
  document.body.style.margin = "0";
  document.body.style.padding = "0";

  table.innerHTML = "";
  for (let i = 0; i < boardSize; i++) {
    const tr = document.createElement("tr");
    tr.style.padding = "0";
    for (let j = 0; j < boardSize; j++) {
      const td = document.createElement("td");
      td.style.padding = "0";
      const button = document.createElement("button");
      button.style.backgroundColor = board[i][j] ? aliveCellColor : deadCellColor;
      if (boardSize >= 50) {
        button.style.border = "none";
        table.style.border = "1px solid black";
      } else {
        button.style.border = "0.5px solid black";
      }
      button.style.width = `${cellSize}px`;
      button.style.height = `${cellSize}px`;
      button.style.padding = "0";
      button.style.display = "block";
      td.appendChild(button);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function rerender() {
  // ２回目以降の盤面生成は一行ずつ行う
  if (currentRow >= boardSize) return;
  for (let j = 0; j < boardSize; j++) {
    const button = table.children[currentRow].children[j].children[0];
    const currentCellColor = button.style.backgroundColor;
    const expectedCellColor = getStyle(board[currentRow][j]);
    if (currentCellColor !== expectedCellColor) {
      button.style.backgroundColor = expectedCellColor;
    }
  }
}

renderBoard();

function generationChange(num) {
  generationFigure = num;
  window.parent.postMessage({ type: "generation_change", data: generationFigure }, "*");
}

function progressBoard() {
  if (currentRow >= boardSize - 1) return;
  const newBoard = structuredClone(board);
  //セルの計算は一行ずつ行う
  for (let j = 1; j < boardSize - 1; j++) {
    const left = board[currentRow][j - 1];
    const center = board[currentRow][j];
    const right = board[currentRow][j + 1];
    newBoard[currentRow + 1][j] = isNextAlive(left, center, right);
  }
  board = newBoard;
  currentRow += 1;
  generationChange(generationFigure + 1);
  rerender();
}

on.progress = () => {
  progressBoard();
};

on.board_reset = () => {
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => 0));
  board[0][centerline] = 1; //初期状態のドットを再配置
  currentRow = 0; //行もリセット
  renderBoard();
  generationChange(0);
};

on.board_randomize = () => {
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => 0));
  for (let j = 0; j < boardSize; j++) {
    board[0][j] = Math.random() > 0.5 ? 1 : 0; //最初の行をランダムにする
  }
  currentRow = 0;
  renderBoard();
  generationChange(0);
};

on.save_board = async () => {
  window.parent.postMessage({ type: "save_board", data: board }, "*");
};
