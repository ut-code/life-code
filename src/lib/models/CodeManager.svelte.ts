import { saveCode, fetchCodeList, loadCodeById, type CodeListItem } from "$lib/api/code";

type SaveState = { saving: false } | { saving: true; data: string; name: string };

type LoadState =
  | { state: "closed" }
  | { state: "loading" }
  | { state: "list"; list: CodeListItem[] };

export class CodeManager {
  saveState = $state<SaveState>({ saving: false });
  loadState = $state<LoadState>({ state: "closed" });

  constructor() {}

  openSaveModal(code: string) {
    this.saveState = { saving: true, data: code, name: "" };
  }

  closeSaveModal() {
    this.saveState = { saving: false };
  }

  async save(isJapanese: boolean) {
    if (!this.saveState.saving) return;
    const name = this.saveState.name.trim() === "" ? "Unnamed Code" : this.saveState.name.trim();
    await saveCode({ code: this.saveState.data, name }, isJapanese);
    this.closeSaveModal();
  }

  async openLoadModal(isJapanese: boolean) {
    this.loadState = { state: "loading" };
    const list = await fetchCodeList(isJapanese);
    if (list) {
      this.loadState = { state: "list", list };
    } else {
      this.loadState = { state: "closed" };
    }
  }

  closeLoadModal() {
    this.loadState = { state: "closed" };
  }

  async load(id: number, isJapanese: boolean): Promise<string | undefined> {
    this.closeLoadModal();
    return await loadCodeById(id, isJapanese);
  }
}
