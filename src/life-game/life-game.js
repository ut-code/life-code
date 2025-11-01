"use strict";

let timer = "stop";
let timerId = 0;
let generationFigure = 0;

//定数
const defaultBoardSize = 20;
const defaultCellSize = 22; //px
const boardSizeMax = 100;
const boardSizeMin = 10;
const defaultLiveAroundMax = 3;
const defaultLiveAroundMin = 2;
const defaultDeadAroundMax = 3;
const defaultDeadAroundMin = 3;

//変数設定
let boardSize = defaultBoardSize;
let cellSize = defaultCellSize;
let livearoundMax = defaultLiveAroundMax;
let livearoundMin = defaultLiveAroundMin;
let deadaroundMax = defaultDeadAroundMax;
let deadaroundMin = defaultDeadAroundMin;

function liveCellJudge(around) {
  //黒いセルの判定を行う関数
  if (livearoundMin <= around && around <= livearoundMax) {
    return true;
  } else {
    return false;
  }
}

function deadCellJudge(around) {
  //白いセルの判定を行う関数
  if (deadaroundMin <= around && around <= deadaroundMax) {
    return true;
  } else {
    return false;
  }
}

const generation = document.getElementById("generation"); //世代を表す文（第+数字+世代)
//BUTTON
const randomButton = document.getElementById("randombutton");
const resetButton = document.getElementById("resetbutton");
const sizeChangeButton = document.getElementById("sizeChangeButton");
//サイズ入力欄
const sizeInput = document.getElementById("sizeInput");
const sizeLabel = document.getElementById("sizeLabel");

// サイズ入力欄の設定
sizeInput.min = boardSizeMin;
sizeInput.max = boardSizeMax;
sizeInput.value = defaultBoardSize;
sizeLabel.textContent = `(${boardSizeMin}〜${boardSizeMax})`;

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
      button.style.width = `${cellSize}px`;
      button.style.height = `${cellSize}px`;
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

randomButton.onclick = () => {
  //白黒ランダムにBoardを変更
  board = Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => Math.random() > 0.5),
  );
  renderBoard();
  generationChange(0);
  stop();
};

resetButton.onclick = () => {
  //すべて白にBoardを変更
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
  renderBoard();
  generationChange(0);
  stop();
};

function generationChange(num) {
  //現在の世代を表すgenerationFigureを変更し、文章も変更
  generationFigure = num;
  generation.textContent = "第" + generationFigure + "世代";
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
      if (board[i][j]) {
        newBoard[i][j] = liveCellJudge(around);
      } else {
        newBoard[i][j] = deadCellJudge(around);
      }
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
};

on.load_board = (boardTemplate) => {
  board = boardTemplate;
};

on.resize = (newBoardSize) => {
  boardSize = newBoardSize;
};

sizeChangeButton.onclick = () => {
  const newSize = parseInt(sizeInput.value, 10);
  if (isNaN(newSize) || newSize < boardSizeMin || boardSizeMax < newSize) {
    alert(`サイズは ${boardSizeMin} から ${boardSizeMax} の間で入力してください。`);
    sizeInput.value = boardSize;
    return;
  }
  boardSize = newSize;
  cellSize = Math.floor(defaultCellSize * (defaultBoardSize / newSize));
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
  renderBoard();
  generationChange(0);
  stop();
  updatePatternButtons();
};
