<script lang="ts">
  import { onMount } from "svelte";
  import event from "@/iframe/event.js?raw";
  import lifeGameHTML from "@/iframe/life-game.html?raw";
  import lifeGameJS from "@/iframe/life-game.js?raw";
  import patterns from "$lib/board-templates";
  import * as icons from "$lib/icons/index.ts";
  import { loadBoard, saveBoard } from "./api.ts";

  let editingCode = $state(lifeGameJS);
  let appliedCode = $state(lifeGameJS);

  const previewDoc = $derived(lifeGameHTML.replace('"@JAVASCRIPT@";', `${event}\n${appliedCode}`));

  let showEditor = $state(true);
  let preview_iframe: HTMLIFrameElement | undefined = $state();
  let isProgress = $state(false);
  let isJapanese = $state(true);
  let resetModalOpen = $state(false);
  let bottomDrawerOpen = $state(false);

  let intervalMs = $state(1000);
  let generationFigure = $state(0);
  let sizeValue = $state(20);

  type SaveState = { saving: false } | { saving: true; boardData: boolean[][] };
  let saveState: SaveState = $state({ saving: false });
  let boardNameInput = $state("");

  type OngoingEvent =
    | "play"
    | "pause"
    | "state_update"
    | "timer_change"
    | "board_reset"
    | "board_randomize"
    | "place_template"
    | "save_board"
    | "apply_board"
    | "request_sync"
    // unused events
    | "board_resize";

  type IncomingEvent = "generation_change" | "sync" | "save_board";

  function handleMessage(event: MessageEvent<{ type: IncomingEvent; data: unknown }>) {
    switch (event.data.type) {
      case "generation_change": {
        generationFigure = event.data.data as number;
        break;
      }
      case "sync": {
        const data = event.data.data as { generationFigure: number; boardSize: number };
        generationFigure = data.generationFigure;
        sizeValue = data.boardSize;
        break;
      }
      case "save_board": {
        saveState = { saving: true, boardData: event.data.data as boolean[][] };
        boardNameInput = "";
        break;
      }
      default: {
        event.data.type satisfies never;
        break;
      }
    }
  }

  onMount(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });

  function sendEvent(event: OngoingEvent, message?: unknown) {
    preview_iframe?.contentWindow?.postMessage({ type: event, data: message }, "*");
  }

  async function handleSave() {
    if (!saveState.saving) return;

    const name = boardNameInput.trim() === "" ? "Unnamed Board" : boardNameInput.trim();

    await saveBoard({ board: saveState.boardData, name: name }, isJapanese);

    saveState = { saving: false };
    boardNameInput = "";
  }

  async function handleLoad() {
    const board = await loadBoard(isJapanese);
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

  <button
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] mx-5"
    onclick={() => {
      isJapanese = !isJapanese;
    }}
  >
    <img class="size-6" src={icons.language} alt="Language" />
  </button>
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
          <p class="font-bold mb-2">
            {isJapanese ? patterns[patternName].names.ja : patterns[patternName].names.en}
          </p>
          <button
            class="btn overflow-hidden p-0 w-24 h-24"
            onclick={() => {
              sendEvent("request_sync");

              const newBoard = Array.from({ length: sizeValue }, () =>
                Array.from({ length: sizeValue }, () => false),
              );
              const patternData = patterns[patternName];
              const patternShape = patternData.shape;
              const patternHeight = patternShape.length;
              const patternWidth = patternShape[0].length;

              if (sizeValue < (patternData.minBoardSize || 0)) {
                if (isJapanese) {
                  alert(
                    `このパターンには ${patternData.minBoardSize}x${patternData.minBoardSize} 以上の盤面が必要です`,
                  );
                } else {
                  alert(
                    `This pattern requires a board size of at least ${patternData.minBoardSize}x${patternData.minBoardSize}.`,
                  );
                }

                return;
              }
              // パターンがボードの中央に来るよう、パターンの左上のセルの位置(startRow, startCol)を調整
              const startRow = Math.floor((sizeValue - patternHeight) / 2);
              const startCol = Math.floor((sizeValue - patternWidth) / 2);

              for (let r = 0; r < patternHeight; r++) {
                for (let c = 0; c < patternWidth; c++) {
                  const boardRow = startRow + r;
                  const boardCol = startCol + c;
                  newBoard[boardRow][boardCol] = patternShape[r][c] === 1;
                }
              }
              bottomDrawerOpen = false;
              sendEvent("place_template", newBoard);
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
    <h3 class="font-bold text-lg">{isJapanese ? "盤面を保存" : "Save board"}</h3>
    <p class="py-4">
      {isJapanese
        ? "保存する盤面に名前を付けてください（任意）。"
        : "Please name the board you wish to save (optional)."}
    </p>
    <input
      type="text"
      placeholder={isJapanese ? "盤面名を入力" : "Enter board name"}
      class="input input-bordered w-full max-w-xs"
      bind:value={boardNameInput}
    />
    <div class="modal-action">
      <button class="btn" onclick={() => (saveState = { saving: false })}
        >{isJapanese ? "キャンセル" : "Cancel"}</button
      >
      <button class="btn btn-primary" onclick={handleSave} disabled={!saveState.saving}>
        {isJapanese ? "保存" : "Save"}
      </button>
    </div>
  </div>
</div>

<input type="checkbox" class="modal-toggle" bind:checked={resetModalOpen} />
<div class="modal" class:modal-open={resetModalOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">{isJapanese ? "リセット確認" : "Reset confirmation"}</h3>
    <p class="py-4">
      {isJapanese
        ? "本当にコードをリセットしますか？この操作は取り消せません。"
        : "Are you sure you want to reset the code? This action cannot be undone."}
    </p>
    <div class="modal-action">
      <button class="btn" onclick={() => (resetModalOpen = false)}
        >{isJapanese ? "キャンセル" : "Cancel"}</button
      >
      <button
        class="btn btn-error"
        onclick={() => {
          // reset code (not board)
          appliedCode = lifeGameJS;
          editingCode = lifeGameJS;
          resetModalOpen = false;
        }}>{isJapanese ? "リセット" : "Reset"}</button
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
          sendEvent("state_update");
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
      bind:value={editingCode}
      class="w-full h-full border-none p-4 font-mono bg-black text-[#0f0]"
    ></textarea>
  </div>
</div>

<div
  class="bg-[#E0E0E0] shadow-sm fixed bottom-0 left-0 right-0 z-50 h-12 p-0 flex items-center px-4"
>
  <!-- Left Section -->
  <div class="flex items-center">
    <button
      class="btn rounded-none h-12 justify-start"
      onclick={() => (bottomDrawerOpen = !bottomDrawerOpen)}
    >
      {#if bottomDrawerOpen}
        ▼
      {:else if isJapanese}
        ▲ テンプレート
      {:else}
        ▲ Template
      {/if}
    </button>

    <div class="font-bold text-black ml-4">
      {isJapanese ? "第" + generationFigure + "世代" : "Generation:" + generationFigure}
    </div>
  </div>

  <!-- Center Section -->
  <div class="flex-1 flex justify-center items-center gap-x-2">
    <button
      class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)]"
      onclick={() => {
        intervalMs = intervalMs * 2;
        sendEvent("timer_change", intervalMs);
      }}
    >
      <img class="size-6" src={icons.decelerate} alt="decelerate" />
    </button>

    <button
      class="btn btn-ghost btn-circle text-black hover:bg-[rgb(220,220,220)]"
      onclick={() => {
        intervalMs = 1000;
        sendEvent("timer_change", intervalMs);
      }}
    >
      x1
    </button>

    <button
      class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)]"
      onclick={() => {
        intervalMs = intervalMs / 2;
        sendEvent("timer_change", intervalMs);
      }}
    >
      <img class="size-6" src={icons.accelerate} alt="accelerate" />
    </button>

    <div class="font-bold text-black ml-2">
      {isJapanese ? "現在の速度" : "Current speed"}: x{1000 / intervalMs}
    </div>

    <div class="w-px bg-gray-400 h-6 mx-4"></div>
    <!-- Separator -->

    <button class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)]">
      <img class="size-6" src={icons.LeftArrow} alt="Left Arrow" />
    </button>

    <button
      class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap"
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

    <button class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)]">
      <img class="size-6" src={icons.RightArrow} alt="Right Arrow" />
    </button>
  </div>

  <!-- Right Section -->
  <div class="flex items-center gap-x-2">
    <div class="font-bold text-black">{isJapanese ? "盤面" : "Board"}:</div>
    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        sendEvent("save_board");
      }}
    >
      {isJapanese ? "保存" : "Save"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        sendEvent("pause");
        handleLoad();
      }}
    >
      {isJapanese ? "ロード" : "Load"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        sendEvent("board_reset");
      }}
    >
      {isJapanese ? "リセット" : "Reset"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        sendEvent("board_randomize");
      }}
    >
      {isJapanese ? "ランダム" : "Random"}
    </button>

    <div class="w-px bg-gray-400 h-6 mx-2"></div>
    <!-- Separator -->

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        appliedCode = editingCode;
      }}
    >
      {isJapanese ? "コードを適用" : "Apply Code"}
    </button>
  </div>
</div>
