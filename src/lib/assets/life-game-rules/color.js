"use strict";

let timer = "stop";
let generationFigure = 0;
let isDragging = false;
let dragMode = 0; // 1: 指定した色にする, 0: 白にする
let isPlacingTemplate = false;
let patternShape = [];
let patternHeight = 0;
let patternWidth = 0;
let previewCells = [];

//変数設定
let boardSize = 20; //盤面の大きさ(20x20)
const cellSize = 600 / boardSize; //セルの大きさ(px)

const WHITE_HEX = 0xffffff;
const BLACK_HEX = 0x000000;
let currentColorHex = BLACK_HEX;
let isColorMode = false;

function hexToRgb(hex) {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff,
  };
}

function rgbToHex(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

function getStyle(hex) {
  const rgb = hexToRgb(hex);
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function isAlive(hex) {
  return hex !== WHITE_HEX;
}

// around: 周囲の生きたセル数 self: 自身が生きているかどうか
function isNextAlive(around, self) {
  // 自身が生きている & 周囲が 2 か 3 で生存
  if (self && 2 <= around && around <= 3) {
    return self;
  }
  // 自身が死んでいる & 周囲が 3 で誕生
  if (!self && around === 3) {
    return 1;
  }
  return 0;
}

// 周囲の色の平均を取得する関数
function getAverageColor(i, j) {
  let totalR = 0,
    totalG = 0,
    totalB = 0,
    count = 0;

  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      if (di === 0 && dj === 0) continue;
      const ni = i + di;
      const nj = j + dj;
      if (ni >= 0 && ni < boardSize && nj >= 0 && nj < boardSize && isAlive(board[ni][nj])) {
        const rgb = hexToRgb(board[ni][nj]);
        totalR += rgb.r;
        totalG += rgb.g;
        totalB += rgb.b;
        count++;
      }
    }
  }

  if (count > 0) {
    return rgbToHex(
      Math.round(totalR / count),
      Math.round(totalG / count),
      Math.round(totalB / count),
    );
  }

  return isColorMode ? currentColorHex : BLACK_HEX;
}

//Boardの初期化
let board = Array.from({ length: boardSize }, () =>
  Array.from({ length: boardSize }, () => WHITE_HEX),
);
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
                board[boardRow][boardCol] = patternShape[r][c] === 1 ? currentColorHex : WHITE_HEX;
              }
            }
            rerender();
            stop();
          } else {
            window.parent.postMessage(
              {
                type: "Size shortage",
                data: {},
              },
              "*",
            );
          }
        } else if (isColorMode && isAlive(board[i][j])) {
          // 色選択モード：生きているセルに色を適用
          board[i][j] = currentColorHex;
          button.style.backgroundColor = getStyle(board[i][j]);
        }
      };
      button.onmousedown = (e) => {
        e.preventDefault();
        if (timer === "stop" && !isPlacingTemplate) {
          isDragging = true;
          if (isAlive(board[i][j])) {
            board[i][j] = WHITE_HEX;
            dragMode = 0; // 白にする
          } else {
            board[i][j] = currentColorHex;
            dragMode = 1; // 指定した色にする
          }
          button.style.backgroundColor = getStyle(board[i][j]);
        }
      };
      button.onmouseenter = () => {
        if (isDragging && timer === "stop" && !isPlacingTemplate) {
          if (dragMode === 1 && !isAlive(board[i][j])) {
            board[i][j] = currentColorHex;
          } else if (dragMode === 0 && isAlive(board[i][j])) {
            board[i][j] = WHITE_HEX;
          }
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
  const newBoard = board.map((row) => [...row]);
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
            around += isAlive(board[i + tate[ii]][j + yoko[jj]]) ? 1 : 0;
          }
        }
      }
      //↑周囲のマスに黒マスが何個あるかを計算(aroundに格納)

      const cellIsAlive = isAlive(board[i][j]);
      const nextAlive = isNextAlive(around, cellIsAlive ? 1 : 0);

      if (nextAlive && !cellIsAlive) {
        // 新しく生まれるセル：周囲の色の平均
        newBoard[i][j] = getAverageColor(i, j);
      } else if (nextAlive) {
        // 生き続けるセル：色を保持
        newBoard[i][j] = board[i][j];
      } else {
        // 死ぬセル：白にする
        newBoard[i][j] = WHITE_HEX;
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

on.play = () => {
  timer = "start";
};

on.pause = () => {
  timer = "stop";
};

on.board_reset = () => {
  //すべて白にBoardを変更
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => WHITE_HEX),
  );
  renderBoard();
  generationChange(0);
  isColorMode = false;
  table.style.cursor = "default";
};

on.board_randomize = () => {
  //ランダムな色にBoardを変更
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => {
      if (Math.random() > 0.5) {
        return hexToRgb(
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
        );
      } else {
        return WHITE_HEX;
      }
    }),
  );
  renderBoard();
  generationChange(0);
};

on.request_sync = () => {
  window.parent.postMessage(
    {
      type: "sync",
      data: {
        generationFigure: generationFigure,
        boardSize: boardSize,
      },
    },
    "*",
  );
  console.log("generationFigure:", generationFigure, "boardSize:", boardSize);
};

on.place_template = (template) => {
  patternShape = template;
  patternHeight = patternShape.length;
  patternWidth = patternShape[0].length;
  isPlacingTemplate = true;
  table.style.cursor = "crosshair";
  stop();
};

on.save_board = async () => {
  window.parent.postMessage({ type: "save_board", data: board }, "*");
};

on.apply_board = (newBoard) => {
  // newBoardが旧形式（number[][]）の場合の変換
  board = newBoard.map((row) =>
    row.map((cell) => {
      if (typeof cell === "number") {
        // 旧形式：0 = 白（死）, 1 = 黒（生）
        return cell === 0 ? WHITE_HEX : BLACK_HEX;
      } else {
        // 新形式：そのまま使用
        return cell;
      }
    }),
  );
  renderBoard();
  generationChange(0);
  stop();
  isColorMode = false;
  table.style.cursor = "default";
};

on.apply_color = (hexValue) => {
  // 16進数の数値を直接受け取る
  currentColorHex = hexValue;
  isColorMode = true;
  table.style.cursor = "crosshair";
};
