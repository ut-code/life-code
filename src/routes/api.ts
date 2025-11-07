export async function saveBoard(board: boolean[][]) {
  try {
    const response = await fetch("/api/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(board),
    });

    if (!response.ok) {
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
    const response = await fetch("/api/board");

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("保存されているデータがありません。");
      } else {
        throw new Error("サーバーとの通信に失敗しました。");
      }
    }

    const loadedBoard = await response.json();

    return loadedBoard as boolean[][]; // TODO: add proper types
  } catch (err) {
    console.error("読込エラー:", err);
    alert("読み込みに失敗しました。");
  }
}
