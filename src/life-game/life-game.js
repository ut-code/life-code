"use strict";
let timerId = 0;
let timer = 'stop'
let generationFigure = 0;
const defaultBoardSize = 20;
const defaultLiveAroundMax = 3;
const defaultLiveAroundMin = 2;
const defaultDeadAroundMax = 3;
const defaultDeadAroundMin = 3;
let boardSize = defaultBoardSize;
let livearoundMax = defaultLiveAroundMax;
let livearoundMin = defaultLiveAroundMin;
let deadaroundMax = defaultDeadAroundMax;
let deadaroundMin = defaultDeadAroundMin;
const generation = document.getElementById('generation');
const startButton = document.getElementById('startbutton');
const stopButton = document.getElementById('stopbutton');
const randomButton = document.getElementById('randombutton')
const resetButton = document.getElementById('resetbutton');
let board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => Math.random() > 0.5));
const table = document.getElementById('game-board');
function renderBoard() {
    table.innerHTML = '';
    for (let i = 0; i < boardSize; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < boardSize; j++) {
            const td = document.createElement('td');
            const button = document.createElement('button');
            button.style.backgroundColor = board[i][j] ? 'black' : 'white';
            button.style.border = '1px solid black';
            button.style.width = '22px'; 
            button.style.height = '22px';
            button.onclick = () => {
                if (timer==='stop'){
                    board[i][j] = !board[i][j];
                    renderBoard();
                }
            };
            td.appendChild(button);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}
renderBoard();

randomButton.onclick =()=>{
    board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => Math.random() > 0.5));
    renderBoard();
    generationChange(0);
}

resetButton.onclick =()=>{
    board = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => false));
    renderBoard();
    generationChange(0);
}

startButton.onclick = start
stopButton.onclick = stop

function generationChange(num){
    generationFigure = num;
    generation.textContent = '第'+generationFigure+'世代';
}

function start(){
    if (timer === 'stop'){
        timerId = setInterval(progressBoard,1000);
        timer = 'start';
    }
}

function stop(){
    if (timer === 'start'){
        clearInterval(timerId);
        timer = 'stop';
    }
}

function progressBoard(){
    const newBoard = structuredClone(board);
    for (let i=0; i<boardSize; i++){
        for (let j=0; j<boardSize; j++){
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
            if (board[i][j]){
                newBoard[i][j] = (livearoundMin<=around && around<=livearoundMax);
            }
            else{
                newBoard[i][j] = (deadaroundMin<=around && around<=deadaroundMax);
            }
        }
    }
    board = newBoard;
    generationChange(generationFigure+1);
    renderBoard();
}