<script lang="ts">
  import lifeGameHTML from "@/iframe/life-game.html?raw";
  import lifeGameJS from "@/iframe/life-game.js?raw";
  import placetemplate from "@/iframe/place_template.js?raw";
  import event from "@/iframe/event.js?raw";

  import * as icons from "$lib/icons/index.ts";
  import patterns from "$lib/board-templates";
  import { onMount } from "svelte";
  import { loadBoard, saveBoard } from "./api.ts";

  let editingcode = $state(lifeGameJS);
  let appliedCode = $state(lifeGameJS);

  let previewDoc = $derived(
    lifeGameHTML.replace(
      /<script src="\.\/life-game\.js"><\/script>/,
      `<script>
      \n${event}\n
      \n${appliedCode}\n
      \n${placetemplate}\n
      <\/script>`,
    ),
  );

  let showEditor = $state(true);
  let preview_iframe: HTMLIFrameElement | undefined = $state();
  let isProgress = $state(false);
  let resetModalOpen = $state(false);
  let bottomDrawerOpen = $state(false);

  let intervalMs = $state(1000);
  let generationFigure = $state(0);
  let sizeInputValue = $state(20);

  type SaveState = { saving: false } | { saving: true; boardData: boolean[][] };
  let saveState: SaveState = $state({ saving: false });
  let boardNameInput = $state("");

  onMount(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "patternError") {
        alert(event.data.message);
      }
      if (event.data.type === "generation_change") {
        generationFigure = event.data.data;
      }
      if (event.data.type === "stateupdate") {
        generationFigure = event.data.data.generationFigure;
        sizeInputValue = event.data.data.boardSize;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });

  function sendEvent(event: string, message?: unknown) {
    preview_iframe?.contentWindow?.postMessage({ type: event, data: message }, "*");
  }

  onMount(() => {
    const handler = async (event: MessageEvent<unknown>) => {
      const data = event.data as
        | { type: "unknown event" }
        | { type: "save_board"; data: boolean[][] };
      if (data.type === "save_board") {
        saveState = { saving: true, boardData: data.data };
        boardNameInput = "";
        return;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  });

  async function handleSave() {
    if (!saveState.saving) return;

    const name = boardNameInput.trim() === "" ? "Unnamed Board" : boardNameInput.trim();

    await saveBoard({ board: saveState.boardData, name: name });

    saveState = { saving: false };
    boardNameInput = "";
  }

  async function handleLoad() {
    const board = await loadBoard();
    if (board) {
      sendEvent("apply_board", board);
    }
    return;
  }
</script>

<div class="navbar bg-[#E0E0E0] shadow-sm">
  <div class="ml-15 avatar w-8 rounded">
    <img src={icons.utcode} alt="ut.code();_Logo" />
  </div>

  <div class="font-semibold text-black text-[20px] ml-5">Life code</div>

  <button
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] ml-auto"
    onclick={() => {
      resetModalOpen = true;
    }}
  >
    <img class="size-6" src={icons.reset} alt="Reset" />
  </button>

  <label class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap mx-5">
    <input type="checkbox" bind:checked={showEditor} />
    <div class="text-black">
      <img class="size-6" src={icons.CodeBracket} alt="Code Bracket" />
    </div>
  </label>

  <div class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] mx-5">
    <img class="size-6" src={icons.language} alt="Language" />
  </div>
</div>

<div
  class="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 bg-black pb-16"
  class:translate-y-full={!bottomDrawerOpen}
  class:translate-y-0={bottomDrawerOpen}
>
  <div class="bg-base-200 shadow-lg p-4 h-48 w-full overflow-x-auto">
    <div class="flex gap-4">
      {#each Object.keys(patterns) as (keyof typeof patterns)[] as patternName (patternName)}
        <div class="text-center flex-shrink-0">
          <p class="font-bold mb-2">{patterns[patternName].names.ja}</p>
          <button
            class="btn overflow-hidden p-0 w-24 h-24"
            onclick={() => {
              preview_iframe?.contentWindow?.postMessage(
                { type: "setPattern", pattern: patterns[patternName] },
                "*",
              );
              bottomDrawerOpen = false;
            }}
          >
            <img
              src={patterns[patternName].image}
              alt={patterns[patternName].names.ja}
              class="w-full h-full object-cover rounded"
            />
          </button>
        </div>
      {/each}
    </div>
  </div>
</div>

<input type="checkbox" class="modal-toggle" bind:checked={saveState.saving} />
<div class="modal" class:modal-open={saveState.saving}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">盤面を保存</h3>
    <p class="py-4">保存する盤面に名前を付けてください（任意）。</p>
    <input
      type="text"
      placeholder="盤面名を入力"
      class="input input-bordered w-full max-w-xs"
      bind:value={boardNameInput}
    />
    <div class="modal-action">
      <button class="btn" onclick={() => (saveState = { saving: false })}>キャンセル</button>
      <button class="btn btn-primary" onclick={handleSave} disabled={!saveState.saving}>
        保存
      </button>
    </div>
  </div>
</div>

<input type="checkbox" class="modal-toggle" bind:checked={resetModalOpen} />
<div class="modal" class:modal-open={resetModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">リセット確認</h3>
    <p class="py-4">本当にリセットしますか？この操作は取り消せません。</p>
    <div class="modal-action">
      <button class="btn" onclick={() => (resetModalOpen = false)}>キャンセル</button>
      <button
        class="btn btn-error"
        onclick={() => {
          // ここにリセット処理を記述
          console.log("Reset executed");
          resetModalOpen = false;
        }}>リセット</button
      >
    </div>
  </div>
</div>

<div class="flex box-border h-screen" style="height: calc(100vh - 4rem - 3rem);">
  <div
    class={[
      "flex overflow-hidden bg-[rgb(202,202,202)] shrink-0 transition-[flex-basis] duration-300 ease-in-out",
      showEditor ? "basis-[60%]" : "basis-full",
    ]}
  >
    <iframe
      bind:this={preview_iframe}
      srcdoc={previewDoc}
      title="Preview"
      sandbox="allow-scripts"
      class="w-[80%] h-[90%] rounded-lg mx-auto my-5 shadow-lg"
      onload={() => {
        setTimeout(() => {
          sendEvent("stateupdate");
          console.log("generationFigure onload:", generationFigure);
        }, 50);
      }}
    ></iframe>
  </div>

  <div
    class={[
      "flex box-border bg-white shrink-0 overflow-hidden transition-[flex-basis,opacity] duration-300 ease-in-out",
      showEditor ? "basis-[40%] opacity-100" : "basis-0 opacity-0",
    ]}
  >
    <textarea
      bind:value={editingcode}
      class="w-full h-full border-none p-4 font-mono bg-black text-[#0f0]"
    ></textarea>
  </div>
</div>

<div class="bg-[#E0E0E0] shadow-sm fixed bottom-0 left-0 right-0 z-50 h-12 p-0 flex items-center">
  <button
    class="btn rounded-none h-12 justify-start"
    onclick={() => (bottomDrawerOpen = !bottomDrawerOpen)}
  >
    {bottomDrawerOpen ? "▼" : "▲ テンプレート"}
  </button>

  <div class="font-bold text-black ml-10">
    第 {generationFigure} 世代
  </div>

  <p class="ml-10 text-black">ボードのサイズ(10~100):</p>
  <input type="number" bind:value={sizeInputValue} class="w-10 text-black bg-white ml-2" />

  <button
    class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black ml-2"
    onclick={() => {
      isProgress = false;
      if (isNaN(sizeInputValue) || sizeInputValue < 10 || sizeInputValue > 100) {
        alert("サイズは10から100の間で指定してください。");
        return;
      }
      sendEvent("sizechange", sizeInputValue.toString());
    }}
  >
    Change
  </button>

  <div
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap fixed left-1/2 !-translate-x-1/2 -ml-15 bottom-1"
  >
    <img class="size-6" src={icons.LeftArrow} alt="Left Arrow" />
  </div>

  <button
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap fixed left-1/2 !-translate-x-1/2 bottom-1"
    onclick={() => {
      const eventName = isProgress ? "pause" : "play";
      sendEvent(eventName);
      isProgress = !isProgress;
    }}
  >
    <input type="checkbox" bind:checked={isProgress} />
    <img class="size-6 swap-on" src={icons.Pause} alt="Pause" />
    <img class="size-6 swap-off" src={icons.Play} alt="Play" />
  </button>

  <div
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap fixed left-1/2 !-translate-x-1/2 ml-15 bottom-1"
  >
    <img class="size-6" src={icons.RightArrow} alt="Right Arrow" />
  </div>

  <button
    class="btn btn-ghost hover:bg-[rgb(220,220,220)] ml-50 text-black"
    onclick={() => {
      isProgress = false;
      sendEvent("boardreset");
    }}
  >
    Reset
  </button>

  <button
    class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
    onclick={() => {
      isProgress = false;
      sendEvent("boardrandom");
    }}
  >
    Random
  </button>

  <button
    class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
    onclick={() => {
      isProgress = false;
      sendEvent("save_board");
    }}
  >
    Save
  </button>

  <button
    class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
    onclick={() => {
      isProgress = false;
      sendEvent("pause");
      handleLoad();
    }}
  >
    Load
  </button>

  <button
    class="btn btn-ghost hover:bg-[rgb(220,220,220)] ml-5 text-black"
    onclick={() => {
      appliedCode = editingcode;
    }}
  >
    Apply Code
  </button>
  <button
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] text-black ml-2"
    onclick={() => {
      intervalMs = intervalMs / 2;
      sendEvent("timer_change", intervalMs);
    }}
  >
    x2
  </button>

  <button
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] text-black ml-2"
    onclick={() => {
      intervalMs = intervalMs * 2;
      sendEvent("timer_change", intervalMs);
    }}
  >
    x0.5
  </button>

  <button
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] text-black ml-2"
    onclick={() => {
      intervalMs = 1000;
      sendEvent("timer_change", intervalMs);
    }}
  >
    Reset Timer
  </button>
</div>
