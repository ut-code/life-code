window.addEventListener("message", (event) => {
  if (event.data.type === "setPattern") {
    const newBoard = Array.from({ length: boardSize }, () =>
      Array.from({ length: boardSize }, () => false),
    );
    const patternData = event.data.pattern;

    if (boardSize < (patternData.minBoardSize || 0)) {
      window.parent.postMessage(
        {
          type: "patternError",
          message: `このパターンには ${patternData.minBoardSize}x${patternData.minBoardSize} 以上の盤面が必要です`,
        },
        "*",
      );
      return;
    } else {
      const patternShape = patternData.shape;
      const patternHeight = patternShape.length;
      const patternWidth = patternShape[0].length;
      //↓パターンがボードの中央に来るよう、パターンの右上のセルの位置(startrow,startCol)を調整
      const startRow = Math.floor((boardSize - patternHeight) / 2);
      const startCol = Math.floor((boardSize - patternWidth) / 2);
      for (let r = 0; r < patternHeight; r++) {
        for (let c = 0; c < patternWidth; c++) {
          const boardRow = startRow + r;
          const boardCol = startCol + c;
          newBoard[boardRow][boardCol] = patternShape[r][c] === 1;
        }
      }
      board = newBoard;
      renderBoard();
      generationChange(0);
      stop();
    }
  }
});
