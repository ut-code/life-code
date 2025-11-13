"use strict";

let timer = "stop";
let timerId = 0;
let generationFigure = 0;
let timerTime = 1000;
let isDragging = false;
let dragMode = false; // true: 黒にする, false: 白にする
let isTemplate = false;
let patternShape = [];
let patternHeight = 0;
let patternWidth = 0;
let previewCells = [];

const DEFAULT_BOARD_SIZE = 20;
const DEFAULT_CELL_SIZE = 30;

//変数設定
let boardSize = 20;
let cellSize = 30;

// around: 周囲の生きたセル数 self: 自身が生きているかどうか
function isNextAlive(around, self) {
  // 自身が生きている & 周囲が 2 か 3 で生存
  if (self && 2 <= around && around <= 3) {
    return true;
  }
  // 自身が死んでいる & 周囲が 3 で誕生
  if (!self && around === 3) {
    return true;
  }
  return false;
}

//Boardの初期化
let board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
const table = document.getElementById("game-board");
function renderBoard() {
  //盤面をBoardに従って変更する関数(Boardを変更したら必ず実行する)
  table.innerHTML = "";
  for (let i = 0; i < boardSize; i++) {
    const tr = document.createElement("tr");
    tr.style.padding = "0";
    for (let j = 0; j < boardSize; j++) {
      const td = document.createElement("td");
      td.style.padding = "0";
      const button = document.createElement("button");
      button.style.backgroundColor = board[i][j] ? "black" : "white"; //Boardの対応する値によって色を変更
      button.style.border = "0.5px solid black";
      button.style.width = `${cellSize}px`;
      button.style.height = `${cellSize}px`;
      button.style.padding = "0"; //cellSizeが小さいとき、セルが横長になることを防ぐ
      button.style.display = "block"; //cellSizeが小さいとき、行間が空きすぎるのを防ぐ
      button.onclick = () => {
        if (isTemplate) {
          clearPreview();
          isTemplate = false;
          if (i + patternHeight < boardSize + 1 && j + patternWidth < boardSize + 1) {
            for (let r = 0; r < patternHeight; r++) {
              for (let c = 0; c < patternWidth; c++) {
                const boardRow = i + r;
                const boardCol = j + c;
                if (patternShape[r][c] === 1) {
                  board[boardRow][boardCol] = true;
                }
              }
            }
            renderBoard();
            generationChange(0);
            resetTimer();
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
        }
      };
      button.onmousedown = (e) => {
        e.preventDefault();
        if (timer === "stop" && !isTemplate) {
          isDragging = true;
          board[i][j] = !board[i][j];
          dragMode = board[i][j];
          button.style.backgroundColor = board[i][j] ? "black" : "white";
        }
      };
      button.onmouseenter = () => {
        if (isDragging && timer === "stop" && board[i][j] !== dragMode && !isTemplate) {
          board[i][j] = dragMode;
          button.style.backgroundColor = board[i][j] ? "black" : "white";
        }
        if (isTemplate) {
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
  if (isTemplate) {
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
    cell.style.backgroundColor = board[cellPos.row][cellPos.col] ? "black" : "white";
  });
  previewCells = [];
}

document.addEventListener("mouseup", () => {
  isDragging = false;
});

renderBoard();
progressBoard();

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
      //周囲のマスに黒マスが何個あるかを計算(aroundに格納)↓
      let around = 0;
      let tate = [0];
      let yoko = [0];
      if (i === 0) {
        tate = [0, 1];
      }
      if (i === boardSize - 1) {
        tate = [0, -1];
      }
      if (0 < i && i < boardSize - 1) {
        tate = [-1, 0, 1];
      }
      if (j === 0) {
        yoko = [0, 1];
      }
      if (j === boardSize - 1) {
        yoko = [0, -1];
      }
      if (0 < j && j < boardSize - 1) {
        yoko = [-1, 0, 1];
      }
      for (let ii = 0; ii < tate.length; ii++) {
        for (let jj = 0; jj < yoko.length; jj++) {
          if (tate[ii] !== 0 || yoko[jj] !== 0) {
            around += board[i + tate[ii]][j + yoko[jj]] ? 1 : 0;
          }
        }
      }
      //↑周囲のマスに黒マスが何個あるかを計算(aroundに格納)
      newBoard[i][j] = isNextAlive(around, board[i][j]);
    }
  }
  board = newBoard;
  generationChange(generationFigure + 1);
  renderBoard();
}

function resetTimer() {
  if (timer !== "stop") {
    timer = "stop";
    clearInterval(timerId);
  }
}

//イベント

on.play = () => {
  timer = "start";
  timerId = setInterval(progressBoard, timerTime);
};

on.pause = () => {
  resetTimer();
};

on.board_resize = (newSize) => {
  boardSize = newSize;
  cellSize = Math.floor(DEFAULT_CELL_SIZE * (DEFAULT_BOARD_SIZE / newSize));
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
  renderBoard();
  generationChange(0);
  resetTimer();
};

on.board_reset = () => {
  //すべて白にBoardを変更
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
  renderBoard();
  generationChange(0);
  resetTimer();
};

on.board_randomize = () => {
  //白黒ランダムにBoardを変更
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => Math.random() > 0.5),
  );
  renderBoard();
  generationChange(0);
  resetTimer();
};

on.timer_change = (ms) => {
  timerTime = ms;
  if (timer === "start") {
    clearInterval(timerId);
    timerId = setInterval(progressBoard, timerTime);
  }
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
  isTemplate = true;
  table.style.cursor = "crosshair";
  stop();
};

on.save_board = async () => {
  window.parent.postMessage({ type: "save_board", data: board }, "*");
};

on.apply_board = (newBoard) => {
  board = newBoard;
  renderBoard();
  generationChange(0);
  resetTimer();
  stop();
};
