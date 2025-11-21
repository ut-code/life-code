"use strict";

let generationFigure = 0;
let isDragging = false;
let dragColor = 0; // ドラッグ中に設定する色
let isPlacingTemplate = false;
let patternShape = [];
let patternHeight = 0;
let patternWidth = 0;
let previewCells = [];
let isColorful = true;

//盤面の大きさ
const boardSize = 20;
const cellSize = 450 / boardSize;

//セルの誕生/生存条件
const birthCounts = [3];
const survivalCounts = [2, 3];

// 色の定数定義
const WHITE = 0xffffff; // 死んだセル（白）
const BLACK = 0x000000; // 生きたセル（黒）
let currentSelectedColor = BLACK; // 描かれるセルの色

// around: 周囲の生きたセル数 self: 自身が生きているかどうか
function isNextAlive(around, self) {
  // 自身が死んでいる & 周囲が birthCounts で誕生
  if (!isAlive(self) && birthCounts.includes(around)) {
    return true;
  }
  // 自身が生きている & 周囲が survivalCounts で生存
  if (isAlive(self) && survivalCounts.includes(around)) {
    return true;
  }
  return false;
}

function isAlive(self) {
  return self !== WHITE ? true : false;
}

// cellの状態に応じた色を返す関数
function getStyle(cell) {
  if (cell === WHITE) return "white";
  // 16進数を#付きの色文字列に変換
  return "#" + cell.toString(16).padStart(6, "0");
}

// 誕生時の色を計算
function getBirthColor(aroundCells) {
  const aliveCells = aroundCells.filter((cell) => isAlive(cell));

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  for (const cell of aliveCells) {
    totalR += (cell >> 16) & 0xff;
    totalG += (cell >> 8) & 0xff;
    totalB += cell & 0xff;
  }

  const avgR = Math.round(totalR / aliveCells.length);
  const avgG = Math.round(totalG / aliveCells.length);
  const avgB = Math.round(totalB / aliveCells.length);

  return (avgR << 16) | (avgG << 8) | avgB;
}

//Boardの初期化
let board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => WHITE));
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
      button.style.backgroundColor = getStyle(board[i][j]); //Boardの対応する値によって色を変更
      // ボードが大きいときは border をつけない
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
      button.onclick = () => {
        if (isPlacingTemplate) {
          clearPreview();
          isPlacingTemplate = false;
          if (i + patternHeight < boardSize + 1 && j + patternWidth < boardSize + 1) {
            for (let r = 0; r < patternHeight; r++) {
              for (let c = 0; c < patternWidth; c++) {
                const boardRow = i + r;
                const boardCol = j + c;
                board[boardRow][boardCol] = patternShape[r][c] ? currentSelectedColor : WHITE;
              }
            }
            rerender();
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
          board[i][j] = board[i][j] === WHITE ? currentSelectedColor : WHITE;
          dragColor = board[i][j];
          button.style.backgroundColor = getStyle(board[i][j]);
        }
      };
      button.onmouseenter = () => {
        if (isDragging && board[i][j] !== dragColor && !isPlacingTemplate) {
          board[i][j] = dragColor;
          button.style.backgroundColor = getStyle(board[i][j]);
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
    cell.style.backgroundColor = getStyle(board[cellPos.row][cellPos.col]);
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
      const expectedCellColor = getStyle(board[i][j]);
      if (currentCellColor !== expectedCellColor) {
        button.style.backgroundColor = expectedCellColor;
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
  const newBoard = structuredClone(board);
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      //周囲のマスに生きたセルが何個あるかを計算(aroundに格納)↓
      let around = 0;
      const aroundCells = [];
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
            if (isAlive(board[i + tate[ii]][j + yoko[jj]])) {
              around += 1;
              aroundCells.push(board[i + tate[ii]][j + yoko[jj]]);
            }
          }
        }
      }
      //↑周囲のマスに生きたセルが何個あるかを計算(aroundに格納)

      // 生死を判定
      if (isNextAlive(around, board[i][j])) {
        // 生きている場合
        newBoard[i][j] = isAlive(board[i][j]) ? board[i][j] : getBirthColor(aroundCells);
      } else {
        // 死んでいる場合
        newBoard[i][j] = WHITE;
      }
    }
  }
  board = newBoard;
  generationChange(generationFigure + 1);
  rerender();
}

//イベント

on.progress = () => {
  progressBoard();
};

on.board_reset = () => {
  //すべて死んだセルにBoardを変更
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => WHITE));
  renderBoard();
  generationChange(0);
};

on.board_randomize = () => {
  //生きたセル死んだセルランダムにBoardを変更
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => {
      if (Math.random() > 0.5) {
        // 生きたセル：ランダムな色を生成
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return (r << 16) | (g << 8) | b;
      } else {
        // 死んだセル
        return WHITE;
      }
    }),
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
  window.parent.postMessage(
    {
      type: "save_board",
      data: {
        board: board,
        isColorful: isColorful,
      },
    },
    "*",
  );
};

on.apply_board = (newBoard) => {
  board = newBoard;
  renderBoard();
  generationChange(0);
};

on.apply_color = (colorValue) => {
  currentSelectedColor = colorValue;
};

on.request_colorful_status = () => {
  window.parent.postMessage({ type: "colorful_status", data: isColorful }, "*");
};
