<script lang="ts">
  import { onMount } from "svelte";
  import event from "@/iframe/event.js?raw";
  import lifeGameHTML from "@/iframe/life-game.html?raw";
  import lifeGameJS from "@/iframe/life-game.js?raw";
  import patterns from "$lib/board-templates";
  import * as icons from "$lib/icons/index.ts";
  import { BoardManager } from "$lib/models/BoardManager.svelte";
  import { CodeManager } from "$lib/models/CodeManager.svelte";
  import BoardModals from "$lib/components/BoardModals.svelte";
  import CodeModals from "$lib/components/CodeModals.svelte";
  import { toast } from "$lib/models/ToastStore.svelte";
  import CodeMirror from "svelte-codemirror-editor";
  import { javascript } from "@codemirror/lang-javascript";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { EditorView } from "@codemirror/view";

  let editingCode = $state(lifeGameJS);
  let appliedCode = $state(lifeGameJS);

  const previewDoc = $derived(lifeGameHTML.replace('"@JAVASCRIPT@";', `${event}\n${appliedCode}`));

  let showEditor = $state(true);
  let preview_iframe: HTMLIFrameElement | undefined = $state();
  let isProgress = $state(false);
  let isJapanese = $state(true);
  let resetModalOpen = $state(false);
  let bottomDrawerOpen = $state(false);

  let generationFigure = $state(0);
  let sizeValue = $state(20);

  const boardManager = new BoardManager();
  const codeManager = new CodeManager();

  let disabledTemplates: { [key: string]: boolean } = $derived.by(() => {
    const newDisabledState: { [key: string]: boolean } = {};
    for (const key in patterns) {
      const patternName = key as keyof typeof patterns;
      const patternData = patterns[patternName];
      newDisabledState[patternName] = sizeValue < (patternData.minBoardSize || 0);
    }
    return newDisabledState;
  });

  let timer: "running" | "stopped" = $state("stopped");
  let intervalMs = $state(1000);
  $effect(() => {
    if (timer === "stopped") return;
    const timerId = setInterval(() => {
      sendEvent("progress");
    }, intervalMs);
    return () => clearInterval(timerId);
  });

  type OngoingEvent =
    | "play"
    | "pause"
    | "board_reset"
    | "board_randomize"
    | "place_template"
    | "save_board"
    | "apply_board"
    | "request_sync"
    | "progress";

  type IncomingEvent = "generation_change" | "sync" | "Size shortage" | "save_board";

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
      case "Size shortage": {
        toast.show(
          isJapanese
            ? "盤面からはみ出してしまうため、キャンセルしました"
            : "This action was canceled because it would have extended beyond the board.",
          "error",
        );
        break;
      }
      case "save_board": {
        boardManager.openSaveModal(event.data.data as boolean[][]);
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

  async function onBoardSelect(id: number) {
    const board = await boardManager.load(id, isJapanese);
    if (board) {
      sendEvent("apply_board", board);
    }
  }

  async function onCodeSelect(id: number) {
    const code = await codeManager.load(id, isJapanese);
    if (code) {
      editingCode = code;
    }
  }

  const editorTheme = EditorView.theme({
    "&": {
      height: "100%",
      maxHeight: "100%",
    },
    ".cm-scroller": {
      overflow: "auto",
      maxHeight: "100%",
    },
    ".cm-content, .cm-gutter": {
      minHeight: "100%",
    },
  });
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
  class="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 bg-black pb-12"
  class:translate-y-full={!bottomDrawerOpen}
  class:translate-y-0={bottomDrawerOpen}
>
  <div class="bg-base-200 shadow-lg p-4 h-48 w-full overflow-x-auto">
    <div class="flex gap-4">
      {#each Object.keys(patterns) as (keyof typeof patterns)[] as patternName (patternName)}
        <div
          class="text-center flex-shrink-0"
          style:opacity={disabledTemplates[patternName] ? 0.3 : 1}
        >
          <p class="font-bold mb-2">
            {isJapanese ? patterns[patternName].names.ja : patterns[patternName].names.en}
          </p>
          <button
            class="btn overflow-hidden p-0 w-24 h-24"
            onclick={() => {
              if (disabledTemplates[patternName]) {
                toast.show(
                  isJapanese
                    ? `このパターンには ${patterns[patternName].minBoardSize}x${patterns[patternName].minBoardSize} 以上の盤面が必要です`
                    : `This pattern requires a board size of at least ${patterns[patternName].minBoardSize}x${patterns[patternName].minBoardSize}.`,
                  "error",
                );
                return;
              }
              const patternData = patterns[patternName];
              const patternShape = patternData.shape;
              bottomDrawerOpen = false;
              sendEvent("place_template", patternShape);
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

<BoardModals manager={boardManager} {isJapanese} onSelect={onBoardSelect} />
<CodeModals manager={codeManager} {isJapanese} onSelect={onCodeSelect} />

<dialog class="modal" open={resetModalOpen}>
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
</dialog>

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
      class="w-[80%] h-[90%] rounded-lg mx-auto my-5 bg-white shadow-lg"
      onload={() => {
        setTimeout(() => {
          sendEvent("request_sync");
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
    <div class="w-full h-full overflow-y-auto">
      <CodeMirror
        bind:value={editingCode}
        lang={javascript()}
        theme={oneDark}
        extensions={[editorTheme]}
      />
    </div>
  </div>
</div>

<div
  class="bg-[#E0E0E0] shadow-sm fixed bottom-0 left-0 right-0 z-50 h-12 p-0 flex items-center px-4"
>
  <!-- Left Section -->
  <div class="flex items-center">
    <button
      class="btn rounded-none h-12 justify-start w-30"
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

    <div class="font-bold text-black ml-4 w-25">
      {isJapanese ? "世代数:" + generationFigure : "Generation:" + generationFigure}
    </div>
  </div>

  <!-- Center Section -->
  <div class="flex-1 flex justify-center items-center gap-x-2">
    <button
      class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)]"
      onclick={() => {
        intervalMs = intervalMs * 2;
      }}
    >
      <img class="size-6" src={icons.decelerate} alt="decelerate" />
    </button>

    <button
      class="btn btn-ghost btn-circle text-black hover:bg-[rgb(220,220,220)]"
      onclick={() => {
        intervalMs = 1000;
      }}
    >
      x1
    </button>

    <button
      class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)]"
      onclick={() => {
        intervalMs = intervalMs / 2;
      }}
    >
      <img class="size-6" src={icons.accelerate} alt="accelerate" />
    </button>

    <div class="font-bold text-black ml-2 w-25">
      {isJapanese ? "現在の速度" : "Current speed"}: x{1000 / intervalMs}
    </div>

    <div class="w-px bg-gray-400 h-6 mx-4"></div>
    <!-- Separator -->

    <button
      class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap"
      onclick={() => {
        if (isProgress) {
          timer = "stopped";
          sendEvent("pause");
        } else {
          timer = "running";
          sendEvent("play");
        }
        isProgress = !isProgress;
      }}
    >
      <input type="checkbox" bind:checked={isProgress} />
      <img class="size-6 swap-on" src={icons.Pause} alt="Pause" />
      <img class="size-6 swap-off" src={icons.Play} alt="Play" />
    </button>
  </div>

  <!-- Right Section -->
  <div class="flex items-center gap-x-2">
    <div class="font-bold text-black">{isJapanese ? "盤面" : "Board"}:</div>
    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        timer = "stopped";
        sendEvent("pause");
        sendEvent("save_board");
      }}
    >
      {isJapanese ? "保存" : "Save"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        timer = "stopped";
        sendEvent("pause");
        boardManager.openLoadModal(isJapanese);
      }}
    >
      {isJapanese ? "ロード" : "Load"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        timer = "stopped";
        sendEvent("pause");
        sendEvent("board_reset");
      }}
    >
      {isJapanese ? "リセット" : "Reset"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        timer = "stopped";
        sendEvent("pause");
        sendEvent("board_randomize");
      }}
    >
      {isJapanese ? "ランダム" : "Random"}
    </button>

    <div class="w-px bg-gray-400 h-6 mx-2"></div>
    <!-- Separator -->
    <div class="font-bold text-black">{isJapanese ? "コード" : "Code"}:</div>
    <button
      class={[
        "btn text-black",
        editingCode === appliedCode ? "btn-ghost hover:bg-[rgb(220,220,220)]" : "btn-success",
      ]}
      onclick={() => {
        appliedCode = editingCode;
        isProgress = false;
        timer = "stopped";
      }}
    >
      {isJapanese ? "適用" : "Apply"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        sendEvent("pause");
        codeManager.openSaveModal(editingCode);
      }}
    >
      {isJapanese ? "保存" : "Save"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        isProgress = false;
        sendEvent("pause");
        codeManager.openLoadModal(isJapanese);
      }}
    >
      {isJapanese ? "ロード" : "Load"}
    </button>
  </div>
</div>
