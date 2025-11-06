"use strict";

let timer = "stop";
let timerId = 0;
let generationFigure = 0;
let timerTime = 1000;

//変数設定
const defaultBoardSize = 20;
const defaultCellSize = 22;
let boardSize = defaultBoardSize;
let CELL_SIZE = defaultCellSize;
const BOARD_MIN = 100;
const BOARD_MAX = 10;

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

const generation = document.getElementById("generation"); //世代を表す文（第+数字+世代)
//BUTTON
const randomButton = document.getElementById("randombutton");
const resetButton = document.getElementById("resetbutton");
const sizeChangeButton = document.getElementById("sizeChangeButton");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
//サイズ入力欄
const sizeInput = document.getElementById("sizeInput");
const sizeLabel = document.getElementById("sizeLabel");

// サイズ入力欄の設定
sizeInput.min = BOARD_MAX;
sizeInput.max = BOARD_MIN;
sizeInput.value = defaultBoardSize;
sizeLabel.textContent = `(${BOARD_MAX}〜${BOARD_MIN})`;

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
  timerId = setInterval(progressBoard, timerTime);
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

on.timer_change = (ms) => {
  timerTime = ms;
  if (timer === "start") {
    clearInterval(timerId);
    timerId = setInterval(progressBoard, timerTime);
  }
};

sizeChangeButton.onclick = () => {
  const newSize = parseInt(sizeInput.value, 10);
  if (isNaN(newSize) || newSize < BOARD_MAX || BOARD_MIN < newSize) {
    alert(`サイズは ${BOARD_MAX} から ${BOARD_MIN} の間で入力してください。`);
    sizeInput.value = boardSize;
    return;
  }
  boardSize = newSize;
  CELL_SIZE = Math.floor(defaultCellSize * (defaultBoardSize / newSize));
  board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
  renderBoard();
  generationChange(0);
  stop();
  updatePatternButtons();
};

saveButton.onclick = async () => {
  console.log("保存ボタンが押されました");
  window.parent.postMessage({ type: "save_board", data: board }, "*");
};

/**
 * 「DBから読込」ボタンが押された時の処理
 */
loadButton.onclick = async () => {
  console.log("読込ボタンが押されました");
  window.parent.postMessage({ type: "request:load_board" }, "*");
};

on.load_board = (loadedBoard) => {
  console.log("on.load_board");
  //
  // 取得したデータで、現在の盤面(board)を上書きする
  //
  board = loadedBoard;

  //
  // 画面を更新し、ゲームの状態をリセットする
  //
  renderBoard(); // 新しい盤面を画面に描画
  generationChange(0); // 世代カウントをリセット
  stop(); //
};
