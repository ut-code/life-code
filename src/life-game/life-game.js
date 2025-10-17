"use strict";
let timerId = 0;
let timer = 'stop'
let generationFigure = 0;

//定数
const defaultBoardSize = 20;
const defaultLiveAroundMax = 3;
const defaultLiveAroundMin = 2;
const defaultDeadAroundMax = 3;
const defaultDeadAroundMin = 3;

//変数設定
let boardSize = defaultBoardSize;
let livearoundMax = defaultLiveAroundMax;
let livearoundMin = defaultLiveAroundMin;
let deadaroundMax = defaultDeadAroundMax;
let deadaroundMin = defaultDeadAroundMin;

function liveCellJudge(around){//黒いセルの判定を行う関数
    if (livearoundMin<=around && around<=livearoundMax){
        return true;
    }
    else{
        return false;
    }
}

function deadCellJudge(around){//白いセルの判定を行う関数
    if (deadaroundMin<=around && around<=deadaroundMax){
        return true;
    }
    else{
        return false;
    }
}

const generation = document.getElementById('generation');//世代を表す文（第+数字+世代)
const isProgress = document.getElementById('timer');//進行中かを表す文(再生中/停止中)
//BUTTON
const startButton = document.getElementById('startbutton');
const stopButton = document.getElementById('stopbutton');
const randomButton = document.getElementById('randombutton')
const resetButton = document.getElementById('resetbutton');
//Boardの初期化
let board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
const table = document.getElementById('game-board');
function renderBoard() {//盤面をBoardに従って変更する関数(Boardを変更したら必ず実行する)
    table.innerHTML = '';
    for (let i = 0; i < boardSize; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < boardSize; j++) {
            const td = document.createElement('td');
            const button = document.createElement('button');
            button.style.backgroundColor = board[i][j] ? 'black' : 'white';//Boardの対応する値によって色を変更
            button.style.border = '1px solid black';
            button.style.width = '22px'; 
            button.style.height = '22px';
            button.onclick = () => {
                if (timer==='stop'){
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

randomButton.onclick =()=>{//白黒ランダムにBoardを変更
    board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => Math.random() > 0.5));
    renderBoard();
    generationChange(0);
    stop();
}

resetButton.onclick =()=>{//すべて白にBoardを変更
    board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
    renderBoard();
    generationChange(0);
    stop();
}

startButton.onclick = start
stopButton.onclick = stop

function timerChange(sentence){//現在再生中かを表すtimer変数を変更し、文章も変更
    timer = sentence;
    isProgress.textContent = timer==='start'?'再生中':'停止中';
}

function generationChange(num){//現在の世代を表すgenerationFigureを変更し、文章も変更
    generationFigure = num;
    generation.textContent = '第'+generationFigure+'世代';
}

function start(){
    if (timer === 'stop'){
        timerId = setInterval(progressBoard,1000);
        timerChange('start');
    }
}

function stop(){
    if (timer === 'start'){
        clearInterval(timerId);
        timerChange('stop');
    }
}

function progressBoard(){
    const newBoard = structuredClone(board);
    for (let i=0; i<boardSize; i++){
        for (let j=0; j<boardSize; j++){
            //周囲のマスに黒マスが何個あるかを計算(aroundに格納)↓
            let around = 0;
            let tate =[0];
            let yoko =[0];
            if (i===0){
                tate=[0,1];
            }
            if (i===boardSize-1){
                tate=[0,-1];
            }
            if (0<i && i<boardSize-1){
                tate=[-1,0,1];
            }
            if (j===0){
                yoko=[0,1];
            }
            if (j===boardSize-1){
                yoko=[0,-1];
            }
            if (0<j && j<boardSize-1){
                yoko=[-1,0,1];
            }
            for (let ii=0; ii<tate.length; ii++){
                for (let jj=0; jj<yoko.length; jj++){
                    if (tate[ii]!==0 || yoko[jj]!==0){
                        around += board[i+tate[ii]][j+yoko[jj]]?1:0;
                    }
                }
            }
            //↑周囲のマスに黒マスが何個あるかを計算(aroundに格納)
            if (board[i][j]){
                newBoard[i][j] = liveCellJudge(around);
            }
            else{
                newBoard[i][j] = deadCellJudge(around);
            }
        }
    }
    board = newBoard;
    generationChange(generationFigure+1);
    renderBoard();
}