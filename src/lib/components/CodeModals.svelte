<script lang="ts">
  import type { CodeManager } from "$lib/models/CodeManager.svelte";

  let {
    manager,
    isJapanese,
    onSelect,
  }: {
    manager: CodeManager;
    isJapanese: boolean;
    onSelect: (id: number) => void;
  } = $props();
</script>

<dialog class="modal" open={manager.saveState.saving}>
  <form method="dialog" class="modal-box">
    <h3 class="font-bold text-lg">{isJapanese ? "コードを保存" : "Save code"}</h3>
    {#if manager.saveState.saving}
      <div class="flex flex-row gap-4 mt-4">
        <div class="w-90 flex flex-col gap-4">
          <p class="py-4">
            {isJapanese
              ? "保存するコードに名前を付けてください（任意）。"
              : "Please name the code you wish to save (optional)."}
          </p>
          <input
            type="text"
            placeholder={isJapanese ? "コード名を入力" : "Enter code name"}
            class="input input-bordered w-full max-w-xs"
            bind:value={manager.saveState.name}
          />
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
    <h3 class="font-bold text-lg">{isJapanese ? "コードをロード" : "Load code"}</h3>

    {#if manager.loadState.state === "loading"}
      <p class="py-4">
        {isJapanese ? "保存されているコードを読み込み中..." : "Loading saved codes..."}
      </p>
      <span class="loading loading-spinner loading-lg"></span>
    {:else if manager.loadState.state === "list" && manager.loadState.list.length === 0}
      <p class="py-4">
        {isJapanese ? "保存されているコードはありません。" : "No saved codes found."}
      </p>
    {:else if manager.loadState.state === "list"}
      <div class="overflow-x-auto h-96">
        <table class="table w-full">
          <thead>
            <tr>
              <th>{isJapanese ? "コード名" : "Code Name"}</th>
              <th>{isJapanese ? "保存日時" : "Saved At"}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each manager.loadState.list as item (item.id)}
              <tr class="hover:bg-base-300">
                <td>{item.name}</td>
                <td>{new Date(item.createdAt).toLocaleString(isJapanese ? "ja-JP" : "en-US")}</td>
                <td class="text-right">
                  <button
                    class="btn btn-sm btn-success text-black"
                    onclick={() => onSelect(item.id)}
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
