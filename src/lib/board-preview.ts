const PREVIEW_SIZE = 20;

/**
 * 任意のサイズの盤面データから、中央 20x20 のプレビューを生成します。
 * 20x20 に満たない場合は、中央に配置し、周囲を false (空白) で埋めます。
 */
export function createBoardPreview(boardData: boolean[][]): boolean[][] {
  const boardHeight = boardData.length;
  const boardWidth = boardData[0]?.length || 0;

  const finalPreview: boolean[][] = Array.from({ length: PREVIEW_SIZE }, () =>
    Array(PREVIEW_SIZE).fill(false),
  );

  const sourceStartRow = Math.max(0, Math.floor((boardHeight - PREVIEW_SIZE) / 2));
  const sourceStartCol = Math.max(0, Math.floor((boardWidth - PREVIEW_SIZE) / 2));

  const destStartRow = Math.max(0, Math.floor((PREVIEW_SIZE - boardHeight) / 2));
  const destStartCol = Math.max(0, Math.floor((PREVIEW_SIZE - boardWidth) / 2));

  const rowsToCopy = Math.min(PREVIEW_SIZE - destStartRow, boardHeight - sourceStartRow);
  const colsToCopy = Math.min(PREVIEW_SIZE - destStartCol, boardWidth - sourceStartCol);

  if (rowsToCopy <= 0 || colsToCopy <= 0) {
    return finalPreview;
  }

  for (let i = 0; i < rowsToCopy; i++) {
    for (let j = 0; j < colsToCopy; j++) {
      if (boardData[sourceStartRow + i]?.[sourceStartCol + j] !== undefined) {
        finalPreview[destStartRow + i][destStartCol + j] =
          boardData[sourceStartRow + i][sourceStartCol + j];
      }
    }
  }

  return finalPreview;
}
