import { toast } from "$lib/models/ToastStore.svelte";

export async function saveCode(data: { code: string; name: string }, isJapanese: boolean) {
  try {
    const response = await fetch("/api/code", {
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
      toast.show("コードを保存しました！", "success");
    } else {
      toast.show("Code saved!", "success");
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

export type CodeListItem = {
  id: number;
  name: string;
  createdAt: string;
};

export async function fetchCodeList(isJapanese: boolean): Promise<CodeListItem[] | undefined> {
  try {
    const response = await fetch("/api/code");

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("There is no saved data.");
      } else {
        throw new Error("Failed to communicate with the server.");
      }
    }

    const codeList = await response.json();

    return codeList as CodeListItem[];
  } catch (err) {
    console.error("Load error", err);
    if (isJapanese) {
      toast.show("読み込みに失敗しました。", "error");
    } else {
      toast.show("Failed to load.", "error");
    }
  }
}

export async function loadCodeById(id: number, isJapanese: boolean): Promise<string | undefined> {
  try {
    const response = await fetch(`/api/code?id=${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("The specified ID data was not found.");
      } else {
        throw new Error("Failed to communicate with the server.");
      }
    }

    const loadedCode = await response.json();

    return loadedCode as string;
  } catch (err) {
    console.error("Load error", err);
    if (isJapanese) {
      toast.show("読み込みに失敗しました。", "error");
    } else {
      toast.show("Failed to load.", "error");
    }
  }
}
