"use strict";

let generationFigure = 0;
let isDragging = false;
let dragMode = 0; // 1: 黒にする, 0: 白にする
let isPlacingTemplate = false;
let patternShape = [];
let patternHeight = 0;
let patternWidth = 0;
let previewCells = [];

//変数設定
let boardSize = 20; //盤面の大きさ(20x20)
const cellSize = 450 / boardSize; //セルの大きさ(px)
const maxLifespan = 2; // セルの最大寿命

// around: 周囲の生きたセル数, currentLifespan: 現在の寿命
function getNextLifespan(around, currentLifespan) {
  // セルが生きている場合
  if (currentLifespan > 0) {
    // 周囲が 2 か 3 なら寿命を維持（減らさない）
    if (2 <= around && around <= 3) {
      return currentLifespan;
    }
    // 条件を満たさない場合は寿命を減らす
    return currentLifespan - 1;
  }

  // セルが死んでいる場合
  // 周囲が 3 なら誕生
  if (around === 3) {
    return maxLifespan;
  }

  return 0;
}

// cellの状態に応じた色を返す関数
function getStyle(cell, lifespan) {
  if (cell === 0) return "white";

  // cellの値に応じて色を返す場合はここに追加
  if (lifespan === 2) return "black";
  if (lifespan === 1) return "gray";
  if (lifespan === 0) return "white";

  return "black"; // デフォルトは黒
}

//Boardの初期化
let board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => 0));
const table = document.getElementById("game-board");

//盤面をBoardに従って変更する関数達(Boardを変更したら実行する)
function renderBoard() {
  // bodyを中央配置に設定
  document.body.style.display = "flex";
  document.body.style.justifyContent = "center";
  document.body.style.alignItems = "center";
  document.body.style.minHeight = "100vh";
  document.body.style.margin = "0";
  document.body.style.padding = "0";

  // 初回の盤面生成
  table.innerHTML = "";
  for (let i = 0; i < boardSize; i++) {
    const tr = document.createElement("tr");
    tr.style.padding = "0";
    for (let j = 0; j < boardSize; j++) {
      const td = document.createElement("td");
      td.style.padding = "0";
      const button = document.createElement("button");
      button.lifespan = board[i][j] ? maxLifespan : 0; // セルの寿命を設定
      button.style.backgroundColor = getStyle(board[i][j], button.lifespan); //Boardの対応する値によって色を変更

      // ボードが大きいときは border をつけない
      if (boardSize >= 50) {
        button.style.border = "none";
        table.style.border = "1px solid black";
      } else {
        button.style.border = "0.5px solid black";
      }
      button.style.width = `${cellSize}px`;
      button.style.height = `${cellSize}px`;
      button.style.padding = "0"; //cellSizeが小さいとき、セルが横長になることを防ぐ
      button.style.display = "block"; //cellSizeが小さいとき、行間が空きすぎるのを防ぐ

      button.onclick = () => {
        if (isPlacingTemplate) {
          clearPreview();
          isPlacingTemplate = false;
          if (i + patternHeight < boardSize + 1 && j + patternWidth < boardSize + 1) {
            for (let r = 0; r < patternHeight; r++) {
              for (let c = 0; c < patternWidth; c++) {
                const boardRow = i + r;
                const boardCol = j + c;
                board[boardRow][boardCol] = patternShape[r][c];
                // パターン配置時に寿命を設定
                if (patternShape[r][c]) {
                  const btn = table.children[boardRow].children[boardCol].children[0];
                  btn.lifespan = maxLifespan;
                }
              }
            }
            rerender();
            generationChange(0);
          } else {
            window.parent.postMessage(
              {
                type: "Size shortage",
                data: {},
              },
              "*",
            );
          }
        }
      };
      button.onmousedown = (e) => {
        e.preventDefault();
        if (!isPlacingTemplate) {
          isDragging = true;
          board[i][j] = board[i][j] ? 0 : 1;
          dragMode = board[i][j];
          button.lifespan = board[i][j] ? maxLifespan : 0;
          button.style.backgroundColor = getStyle(board[i][j], button.lifespan);
        }
      };
      button.onmouseenter = () => {
        if (isDragging && board[i][j] !== dragMode && !isPlacingTemplate) {
          board[i][j] = dragMode;
          button.lifespan = board[i][j] ? maxLifespan : 0;
          button.style.backgroundColor = getStyle(board[i][j], button.lifespan);
        }
        if (isPlacingTemplate) {
          drawPreview(i, j);
        }
      };
      td.appendChild(button);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

table.onmouseleave = () => {
  if (isPlacingTemplate) {
    clearPreview();
  }
};

function drawPreview(row, col) {
  clearPreview();
  for (let r = 0; r < patternHeight; r++) {
    for (let c = 0; c < patternWidth; c++) {
      if (patternShape[r][c] === 1) {
        const boardRow = row + r;
        const boardCol = col + c;
        if (boardRow < boardSize && boardCol < boardSize) {
          const cell = table.rows[boardRow].cells[boardCol].firstChild;
          cell.style.backgroundColor = "gray";
          previewCells.push({ row: boardRow, col: boardCol });
        }
      }
    }
  }
}

function clearPreview() {
  previewCells.forEach((cellPos) => {
    const cell = table.rows[cellPos.row].cells[cellPos.col].firstChild;
    const lifespan = cell.lifespan || 0;
    cell.style.backgroundColor = getStyle(board[cellPos.row][cellPos.col], lifespan);
  });
  previewCells = [];
}

function rerender() {
  // ２回目以降の盤面生成
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const button = table.children[i].children[j].children[0];

      // 色の更新
      const currentCellColor = button.style.backgroundColor;
      const expectedCellColor = getStyle(board[i][j], button.lifespan);
      if (currentCellColor !== expectedCellColor) {
        button.style.backgroundColor = expectedCellColor;
      }

      // セルサイズの更新
      const currentCellsize = button.style.width;
      const expectedCellsize = `${cellSize}px`;
      if (currentCellsize !== expectedCellsize) {
        button.style.width = expectedCellsize;
        button.style.height = expectedCellsize;
      }
    }
  }
}

document.addEventListener("mouseup", () => {
  isDragging = false;
});

renderBoard();

function generationChange(num) {
  //現在の世代を表すgenerationFigureを変更し、文章も変更
  generationFigure = num;
  window.parent.postMessage(
    {
      type: "generation_change",
      data: generationFigure,
    },
    "*",
  );
}

function progressBoard() {
  const newLifespans = Array(boardSize)
    .fill(0)
    .map(() => Array(boardSize).fill(0));

  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      //周囲のマスに黒マスが何個あるかを計算(aroundに格納)↓
      let around = 0;
      let tate, yoko;
      if (i === 0) {
        tate = [0, 1];
      } else if (i === boardSize - 1) {
        tate = [0, -1];
      } else {
        tate = [-1, 0, 1];
      }
      if (j === 0) {
        yoko = [0, 1];
      } else if (j === boardSize - 1) {
        yoko = [0, -1];
      } else {
        yoko = [-1, 0, 1];
      }
      for (let ii = 0; ii < tate.length; ii++) {
        for (let jj = 0; jj < yoko.length; jj++) {
          if (tate[ii] !== 0 || yoko[jj] !== 0) {
            const neighborButton = table.children[i + tate[ii]].children[j + yoko[jj]].children[0];
            around += neighborButton.lifespan > 0 ? 1 : 0;
          }
        }
      }
      //↑周囲のマスに黒マスが何個あるかを計算(aroundに格納)

      // 前の世代の寿命をボタンから取得し、新しい寿命を計算して保存
      const button = table.children[i].children[j].children[0];
      const currentLifespan = button.lifespan;
      newLifespans[i][j] = getNextLifespan(around, currentLifespan);
    }
  }

  // 新しい寿命を適用
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const button = table.children[i].children[j].children[0];
      button.lifespan = newLifespans[i][j];
      board[i][j] = button.lifespan > 0 ? 1 : 0;
    }
  }

  generationChange(generationFigure + 1);
  rerender();
}

//イベント

on.progress = () => {
  progressBoard();
};

on.board_reset = () => {
  //すべて白にBoardを変更
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => 0));
  renderBoard();
  generationChange(0);
};

on.board_randomize = () => {
  //白黒ランダムにBoardを変更
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => (Math.random() > 0.5 ? 1 : 0)),
  );
  renderBoard();
  generationChange(0);
};

on.get_boardsize = () => {
  window.parent.postMessage({ type: "get_boardsize", data: boardSize }, "*");
};

on.place_template = (template) => {
  patternShape = template;
  patternHeight = patternShape.length;
  patternWidth = patternShape[0].length;
  isPlacingTemplate = true;
  table.style.cursor = "crosshair";
};

on.save_board = async () => {
  window.parent.postMessage({ type: "save_board", data: board }, "*");
};

on.apply_board = (newBoard) => {
  board = newBoard;
  renderBoard();
  generationChange(0);
};
