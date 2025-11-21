<script lang="ts">
  import type { BoardManager } from "$lib/models/BoardManager.svelte";

  let {
    manager,
    isJapanese,
    onSelect,
    isColorful,
  }: {
    manager: BoardManager;
    isJapanese: boolean;
    onSelect: (id: number) => void;
    isColorful: boolean;
  } = $props();

  let showConfirmation = $state(false);
  let selectedBoardId = $state<number | null>(null);

  function handleLoadClick(id: number) {
    selectedBoardId = id;
    showConfirmation = true;
  }

  function handleConfirmLoad() {
    if (selectedBoardId !== null) {
      onSelect(selectedBoardId);
    }
    showConfirmation = false;
    selectedBoardId = null;
  }

  function getCellColor(cell: number): string {
    const WHITE = 0xffffff;

    if (isColorful) {
      // 色対応版（0xFFFFFF形式）
      if (cell === WHITE) return "white";
      return "#" + cell.toString(16).padStart(6, "0");
    } else {
      // レガシー版（0/1形式）への互換性
      if (cell === 0) return "white";
      if (cell === 1) return "black";
    }
    return "white"; // 不明な値の場合
  }
</script>

<dialog class="modal" open={manager.saveState.saving}>
  <form method="dialog" class="modal-box">
    <h3 class="font-bold text-lg">{isJapanese ? "盤面を保存" : "Save board"}</h3>
    {#if manager.saveState.saving}
      <div class="flex flex-row gap-4 mt-4">
        <div class="w-90 flex flex-col gap-4">
          <p class="py-4">
            {isJapanese
              ? "保存する盤面に名前を付けてください（任意）。"
              : "Please name the board you wish to save (optional)."}
          </p>
          <input
            type="text"
            placeholder={isJapanese ? "盤面名を入力" : "Enter board name"}
            class="input input-bordered w-full max-w-xs"
            bind:value={manager.saveState.name}
          />
        </div>
        <div class="flex flex-col flex-shrink-0">
          <div class="text-center text-sm mb-2">
            {isJapanese ? "プレビュー" : "Preview"}
          </div>
          <div class="board-preview">
            {#each manager.saveState.preview as row, i (i)}
              <div class="preview-row">
                {#each row as cell, j (j)}
                  <div class="preview-cell" style="background-color: {getCellColor(cell)}"></div>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>
      <div class="modal-action">
        <button type="button" class="btn" onclick={() => manager.closeSaveModal()}
          >{isJapanese ? "キャンセル" : "Cancel"}</button
        >
        <button
          type="submit"
          class="btn btn-success text-black"
          onclick={() => manager.save(isJapanese)}
          disabled={!manager.saveState.saving}
        >
          {isJapanese ? "保存" : "Save"}
        </button>
      </div>
    {/if}
  </form>
</dialog>

<dialog class="modal" open={manager.loadState.state !== "closed"}>
  <div class="modal-box w-11/12 max-w-5xl">
    <h3 class="font-bold text-lg">{isJapanese ? "盤面をロード" : "Load board"}</h3>

    {#if manager.loadState.state === "loading"}
      <p class="py-4">
        {isJapanese ? "保存されている盤面を読み込み中..." : "Loading saved boards..."}
      </p>
      <span class="loading loading-spinner loading-lg"></span>
    {:else if manager.loadState.state === "list" && manager.loadState.list.length === 0}
      <p class="py-4">
        {isJapanese ? "保存されている盤面はありません。" : "No saved boards found."}
      </p>
    {:else if manager.loadState.state === "list"}
      <div class="overflow-x-auto h-96">
        <table class="table w-full">
          <thead>
            <tr>
              <th class="pl-5">{isJapanese ? "プレビュー" : "Preview"}</th>
              <th>{isJapanese ? "盤面名" : "Board Name"}</th>
              <th>{isJapanese ? "保存日時" : "Saved At"}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each manager.loadState.list as item (item.id)}
              <tr class="hover:bg-base-300">
                <td>
                  <div class="board-preview">
                    {#each item.preview as row, i (i)}
                      <div class="preview-row">
                        {#each row as cell, j (j)}
                          <div
                            class="preview-cell"
                            style="background-color: {getCellColor(cell)}"
                          ></div>
                        {/each}
                      </div>
                    {/each}
                  </div>
                </td>
                <td>{item.name}</td>
                <td>{new Date(item.createdAt).toLocaleString(isJapanese ? "ja-JP" : "en-US")}</td>
                <td class="text-right">
                  <button
                    class="btn btn-sm btn-success text-black"
                    onclick={() => handleLoadClick(item.id)}
                  >
                    {isJapanese ? "ロード" : "Load"}
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <div class="modal-action">
      <button class="btn" onclick={() => manager.closeLoadModal()}>
        {isJapanese ? "閉じる" : "Close"}
      </button>
    </div>
  </div>
</dialog>

<dialog class="modal modal-middle" open={showConfirmation}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">
      {isJapanese ? "警告" : "Caution"}
    </h3>
    <p class="py-4">
      {isJapanese
        ? "盤面に加え、コードも上書きされます。よろしいですか？"
        : "The current board and **CODE** will be overwritten. Are you sure?"}
    </p>
    <div class="modal-action">
      <button class="btn btn-error" onclick={() => (showConfirmation = false)}>
        {isJapanese ? "いいえ" : "No"}
      </button>
      <button class="btn btn-success text-black" onclick={handleConfirmLoad}>
        {isJapanese ? "はい" : "Yes"}
      </button>
    </div>
  </div>
</dialog>

<style>
  .board-preview {
    display: grid;
    grid-template-columns: repeat(20, 3px);
    grid-template-rows: repeat(20, 3px);
    width: 60px;
    height: 60px;
    border: 1px solid #9ca3af;
    background-color: white;
  }
  .preview-row {
    display: contents;
  }
  .preview-cell {
    width: 3px;
    height: 3px;
  }
</style>
