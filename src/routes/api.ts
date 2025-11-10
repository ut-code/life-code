export async function saveBoard(data: { board: boolean[][]; name: string; japanese: boolean }) {
  try {
    const response = await fetch("/api/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (data.japanese) {
        throw new Error("サーバーとの通信に失敗しました。");
      } else {
        throw new Error("Failed to communicate with the server.");
      }
    }

    if (data.japanese) {
      alert("盤面を保存しました！");
    } else {
      alert("Board saved!");
    }
  } catch (err) {
    if (data.japanese) {
      console.error("保存エラー:", err);
      alert("保存に失敗しました。");
    } else {
      console.error("Save Error:", err);
      alert("Failed to save.");
    }
  }
}

export async function loadBoard(japanese: boolean): Promise<boolean[][] | undefined> {
  try {
    const response = await fetch("/api/board");

    if (!response.ok) {
      if (response.status === 404) {
        if (japanese) {
          throw new Error("保存されているデータがありません。");
        } else {
          throw new Error("There is no saved data.");
        }
      } else {
        if (japanese) {
          throw new Error("サーバーとの通信に失敗しました。");
        } else {
          throw new Error("Failed to communicate with the server.");
        }
      }
    }

    const loadedBoard = await response.json();

    return loadedBoard as boolean[][]; // TODO: add proper types
  } catch (err) {
    if (japanese) {
      console.error("読込エラー:", err);
      alert("読み込みに失敗しました。");
    } else {
      console.error("Load error", err);
      alert("Failed to load.");
    }
  }
}
