"use strict";

let timer = "stop";
let timerId = 0;
let generationFigure = 0;

const defaultBoardSize = 20;
const defaultCellSize = 30;

//変数設定
let boardSize = 20;
let CELL_SIZE = 30;
const BOARD_MIN = 10;
const BOARD_MAX = 100;

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
table.style.borderCollapse = "collapse";
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
      button.style.width = `${CELL_SIZE}px`;
      button.style.height = `${CELL_SIZE}px`;
      button.style.padding = "0"; //cellSizeが小さいとき、セルが横長になることを防ぐ
      button.style.display = "block"; //cellSizeが小さいとき、行間が空きすぎるのを防ぐ
      button.onclick = () => {
        if (timer === "stop") {
          board[i][j] = !board[i][j];
          renderBoard();
          //クリックされたら色を反転して盤面を変更
        }
      };
      td.appendChild(button);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

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

//イベント

on.play = () => {
  timer = "start";
  timerId = setInterval(progressBoard, 1000);
};

on.pause = () => {
  timer = "stop";
  clearInterval(timerId);
  window.parent.postMessage(
    {
      type: "pause",
    },
    "*",
  );
};

on.load_board = (boardTemplate) => {
  board = boardTemplate;
};

on.resize = (newBoardSize) => {
  boardSize = newBoardSize;
};

on.boardreset = () => {
  //すべて白にBoardを変更
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
  renderBoard();
  generationChange(0);
  on.pause();
};

on.boardrandom = () => {
  //白黒ランダムにBoardを変更
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => Math.random() > 0.5),
  );
  renderBoard();
  generationChange(0);
  on.pause();
};

on.sizechange = (newSizenum) => {
  const newSize = parseInt(newSizenum, 10);
  if (isNaN(newSize) || newSize < BOARD_MIN || BOARD_MAX < newSize) {
    window.parent.postMessage(
      {
        type: "sizeError",
        message: `サイズは ${BOARD_MIN} から ${BOARD_MAX} の間で入力してください。`,
      },
      "*",
    );
    return;
  }
  boardSize = newSize;
  CELL_SIZE = Math.floor(defaultCellSize * (defaultBoardSize / newSize));
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
  renderBoard();
  generationChange(0);
  on.pause();
};
