import { toast } from "$lib/models/ToastStore.svelte";

export async function saveBoard(
  data: { board: number[][]; name: string; code: string; isColorful: boolean },
  isJapanese: boolean,
) {
  try {
    const response = await fetch("/api/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to communicate with the server.");
    }

    if (isJapanese) {
      toast.show("盤面を保存しました！", "success");
    } else {
      toast.show("Board saved!", "success");
    }
  } catch (err) {
    console.error("Save Error:", err);
    if (isJapanese) {
      toast.show("保存に失敗しました。", "error");
    } else {
      toast.show("Failed to save.", "error");
    }
  }
}

export type BoardListItem = {
  id: number;
  name: string;
  createdAt: string;
  preview: number[][];
  isColorful: boolean;
};

export async function fetchBoardList(isJapanese: boolean): Promise<BoardListItem[] | undefined> {
  try {
    const response = await fetch("/api/board");

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("There is no saved data.");
      } else {
        throw new Error("Failed to communicate with the server.");
      }
    }

    const boardList = await response.json();

    return boardList as BoardListItem[];
  } catch (err) {
    console.error("Load error", err);
    if (isJapanese) {
      toast.show("読み込みに失敗しました。", "error");
    } else {
      toast.show("Failed to load.", "error");
    }
  }
}

export type LoadedBoardData = {
  board: number[][];
  code: string;
  isColorful: boolean;
};

export async function loadBoardById(
  id: number,
  isJapanese: boolean,
): Promise<LoadedBoardData | undefined> {
  try {
    const response = await fetch(`/api/board?id=${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("The specified ID data was not found.");
      } else {
        throw new Error("Failed to communicate with the server.");
      }
    }

    const loadedBoard = await response.json();

    return loadedBoard as LoadedBoardData;
  } catch (err) {
    console.error("Load error", err);
    if (isJapanese) {
      toast.show("読み込みに失敗しました。", "error");
    } else {
      toast.show("Failed to load.", "error");
    }
  }
}
