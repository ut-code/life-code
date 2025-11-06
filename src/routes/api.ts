export async function saveBoard(board: boolean[][]) {
  try {
    // Phase 1 で作ったAPI（/api/board）に、
    // 'POST' メソッドで現在の盤面(board)をJSON形式で送信
    const response = await fetch("/api/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(board), //
    });

    if (!response.ok) {
      // サーバーがエラーを返した場合
      throw new Error("サーバーとの通信に失敗しました。");
    }

    alert("盤面を保存しました！");
  } catch (err) {
    console.error("保存エラー:", err);
    alert("保存に失敗しました。");
  }
}

export async function loadBoard(): Promise<boolean[][] | undefined> {
  try {
    // Phase 1 で作ったAPI（/api/board）に、
    // 'GET' メソッド（デフォルト）でデータを要求
    const response = await fetch("/api/board");

    if (!response.ok) {
      if (response.status === 404) {
        // Phase 1 のAPIで、データが1件もない場合に404を返すようにしたため
        throw new Error("保存されているデータがありません。");
      } else {
        throw new Error("サーバーとの通信に失敗しました。");
      }
    }

    // サーバーから返ってきたJSONデータを取得
    const loadedBoard = await response.json();

    console.log("fetched board:", loadedBoard);
    return loadedBoard as boolean[][]; // TODO: add proper types
  } catch (err) {
    console.error("読込エラー:", err);
    alert("読み込みに失敗しました。");
  }
}
