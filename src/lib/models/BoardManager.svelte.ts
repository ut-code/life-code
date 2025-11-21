import { createBoardPreview } from "$lib/board-preview";
import {
  saveBoard,
  fetchBoardList,
  loadBoardById,
  type BoardListItem,
  type LoadedBoardData,
} from "$lib/api/board";

type SaveState =
  | { saving: false }
  | {
      saving: true;
      board: number[][];
      name: string;
      preview: number[][];
      code: string;
      isColorful: boolean;
    };

type LoadState =
  | { state: "closed" }
  | { state: "loading" }
  | { state: "list"; list: BoardListItem[] };

export class BoardManager {
  saveState = $state<SaveState>({ saving: false });
  loadState = $state<LoadState>({ state: "closed" });

  constructor() {}

  openSaveModal(board: number[][], code: string, isColorful: boolean) {
    const preview = createBoardPreview(board);
    this.saveState = {
      saving: true,
      board: board,
      name: "",
      preview: preview,
      code: code,
      isColorful: isColorful,
    };
  }

  closeSaveModal() {
    this.saveState = { saving: false };
  }

  async save(isJapanese: boolean) {
    if (!this.saveState.saving) return;
    const name = this.saveState.name.trim() === "" ? "Unnamed Board" : this.saveState.name.trim();
    await saveBoard(
      {
        board: this.saveState.board,
        name: name,
        code: this.saveState.code,
        isColorful: this.saveState.isColorful,
      },
      isJapanese,
    );
    this.closeSaveModal();
  }

  async openLoadModal(isJapanese: boolean) {
    this.loadState = { state: "loading" };
    const list = await fetchBoardList(isJapanese);
    if (list) {
      this.loadState = { state: "list", list };
    } else {
      this.loadState = { state: "closed" };
    }
  }

  closeLoadModal() {
    this.loadState = { state: "closed" };
  }

  async load(id: number, isJapanese: boolean): Promise<LoadedBoardData | undefined> {
    this.closeLoadModal();
    return await loadBoardById(id, isJapanese);
  }
}
