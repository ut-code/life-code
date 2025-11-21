<script lang="ts">
  import { onMount } from "svelte";
  import event from "@/iframe/event.js?raw";
  import lifeGameHTML from "@/iframe/life-game.html?raw";
  import lifeGameJS from "@/iframe/life-game.js?raw";
  import { rulesExplanation, type RuleExplanation } from "$lib/rules-explanation";
  import patterns from "$lib/board-templates";
  import * as icons from "$lib/icons/index.ts";
  import { BoardManager } from "$lib/models/BoardManager.svelte";
  import { CodeManager } from "$lib/models/CodeManager.svelte";
  import BoardModals from "$lib/components/BoardModals.svelte";
  import CodeModals from "$lib/components/CodeModals.svelte";
  import HelpModal from "$lib/components/HelpModal.svelte";
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
  let isJapanese = $state(true);
  let resetModalOpen = $state(false);
  let helpModalOpen = $state(true);
  let templateDrawerOpen = $state(false);
  let ruleDrawerOpen = $state(false);

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

  let timerIsRunnning = $state(false);
  let intervalMs = $state(1000);
  $effect(() => {
    if (!timerIsRunnning) return;
    const timerId = setInterval(() => {
      sendEvent("progress");
    }, intervalMs);
    return () => clearInterval(timerId);
  });

  type OngoingEvent =
    | "board_reset"
    | "board_randomize"
    | "place_template"
    | "save_board"
    | "apply_board"
    | "get_boardsize"
    | "progress";

  type IncomingEvent =
    | "generation_change"
    | "get_boardsize"
    | "Size shortage"
    | "save_board"
    | "show_toast"
    | "timer_change";

  function handleMessage(event: MessageEvent<{ type: IncomingEvent; data: unknown }>) {
    switch (event.data.type) {
      case "generation_change": {
        generationFigure = event.data.data as number;
        break;
      }
      case "get_boardsize": {
        const data = event.data.data as number;
        sizeValue = data;
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
        boardManager.openSaveModal(event.data.data as number[][], appliedCode as string);
        break;
      }
      case "show_toast": {
        const sentence = event.data.data as { japanese: string; english: string };
        toast.show(isJapanese ? sentence.japanese : sentence.english, "info");
        break;
      }
      case "timer_change": {
        timerIsRunnning = event.data.data as boolean;
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
    const data = await boardManager.load(id, isJapanese);
    if (data) {
      editingCode = data.code;
      appliedCode = data.code;
      sendEvent("apply_board", data.board);
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

  function selectRule(rule: RuleExplanation) {
    editingCode = rule.code;
    appliedCode = rule.code;
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

  <label class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap ml-5">
    <input type="checkbox" bind:checked={showEditor} />
    <div class="text-black">
      <img class="size-6" src={icons.CodeBracket} alt="Code Bracket" />
    </div>
  </label>

  <button
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] ml-5"
    onclick={() => {
      helpModalOpen = true;
    }}
  >
    <img class="size-6" src={icons.questionmark} alt="Info" />
  </button>

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
  class="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 bg-base-200 pb-22"
  class:translate-y-full={!templateDrawerOpen}
  class:translate-y-0={templateDrawerOpen}
>
  <div class="p-4 h-48 w-full overflow-x-auto">
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
              templateDrawerOpen = false;
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

<div
  class="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 bg-base-200 pb-22"
  class:translate-y-full={!ruleDrawerOpen}
  class:translate-y-0={ruleDrawerOpen}
>
  <div class="p-4 h-40 w-full overflow-x-auto">
    <div class="flex gap-4">
      {#each Object.entries(rulesExplanation) as [ruleName, ruleData] (ruleName)}
        <button
          class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer text-left flex-shrink-0 w-64"
          onclick={() => {
            selectRule(ruleData as RuleExplanation);
            ruleDrawerOpen = false;
          }}
        >
          <div class="card-body p-4">
            <h3 class="card-title text-lg text-primary">
              {isJapanese ? ruleData.name.ja : ruleData.name.en}
            </h3>
            <p class="text-sm text-base-content">
              {isJapanese ? ruleData.description.ja : ruleData.description.en}
            </p>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<BoardModals manager={boardManager} {isJapanese} onSelect={onBoardSelect} />
<CodeModals manager={codeManager} {isJapanese} onSelect={onCodeSelect} />
<HelpModal open={helpModalOpen} {isJapanese} onClose={() => (helpModalOpen = false)} />

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
          sendEvent("get_boardsize");
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

<div class="fixed bottom-12 left-0 right-0 z-50 flex justify-start px-4 h-8">
  <button
    class="btn btn-sm text-sm rounded-t-lg rounded-b-none h-full justify-start mr-2 transition-colors duration-300 border-b-0"
    class:bg-base-200={!templateDrawerOpen}
    class:bg-[#E0E0E0]={templateDrawerOpen}
    onclick={() => {
      timerIsRunnning = false;
      templateDrawerOpen = !templateDrawerOpen;
      ruleDrawerOpen = false;
    }}
  >
    {#if templateDrawerOpen}
      ▼ {isJapanese ? "テンプレート" : "Template"}
    {:else if isJapanese}
      ▲ テンプレート
    {:else}
      ▲ Template
    {/if}
  </button>

  <button
    class="btn btn-sm text-sm rounded-t-lg rounded-b-none h-full justify-start transition-colors duration-300 border-b-0"
    class:bg-base-200={!ruleDrawerOpen}
    class:bg-[#E0E0E0]={ruleDrawerOpen}
    onclick={() => {
      timerIsRunnning = false;
      ruleDrawerOpen = !ruleDrawerOpen;
      templateDrawerOpen = false;
    }}
  >
    {#if ruleDrawerOpen}
      ▼ {isJapanese ? "ルール選択" : "Select Rule"}
    {:else if isJapanese}
      ▲ ルール選択
    {:else}
      ▲ Select Rule
    {/if}
  </button>
</div>

<div
  class="bg-[#E0E0E0] shadow-sm fixed bottom-0 left-0 right-0 z-50 h-12 p-0 flex items-center px-4"
>
  <!-- Left Section -->
  <div class="flex items-center gap-x-2 ml-4">
    <div class="font-bold text-black w-30">
      {isJapanese ? "世代数:" + generationFigure : "Generation:" + generationFigure}
    </div>

    <button
      class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)]"
      onclick={() => {
        if (intervalMs < 8000) {
          intervalMs = intervalMs * 2;
        }
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
        if (intervalMs > 20) {
          intervalMs = intervalMs / 2;
        }
      }}
    >
      <img class="size-6" src={icons.accelerate} alt="accelerate" />
    </button>

    <div class="font-bold text-black ml-2 w-40">
      {isJapanese ? "現在の速度" : "Current speed"}: x{1000 / intervalMs}
    </div>

    <button
      class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap"
      onclick={() => {
        timerIsRunnning = !timerIsRunnning;
      }}
    >
      <input type="checkbox" bind:checked={timerIsRunnning} />
      <img class="size-6 swap-on" src={icons.Pause} alt="Pause" />
      <img class="size-6 swap-off" src={icons.Play} alt="Play" />
    </button>
  </div>

  <!-- Center Section -->
  <div class="flex-1 flex justify-center items-center gap-x-2">
    <div class="font-bold text-black">{isJapanese ? "盤面" : "Board"}:</div>
    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        timerIsRunnning = false;
        sendEvent("save_board");
      }}
    >
      {isJapanese ? "保存" : "Save"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        timerIsRunnning = false;
        boardManager.openLoadModal(isJapanese);
      }}
    >
      {isJapanese ? "ロード" : "Load"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        timerIsRunnning = false;
        sendEvent("board_reset");
      }}
    >
      {isJapanese ? "リセット" : "Reset"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        timerIsRunnning = false;
        sendEvent("board_randomize");
      }}
    >
      {isJapanese ? "ランダム" : "Random"}
    </button>
  </div>

  <!-- Right Section -->
  <div class="flex items-center gap-x-2 mr-4">
    <div class="font-bold text-black">{isJapanese ? "コード" : "Code"}:</div>
    <button
      class={[
        "btn text-black",
        editingCode === appliedCode ? "btn-ghost hover:bg-[rgb(220,220,220)]" : "btn-success",
      ]}
      onclick={() => {
        appliedCode = editingCode;
        timerIsRunnning = false;
      }}
    >
      {isJapanese ? "適用" : "Apply"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        timerIsRunnning = false;
        codeManager.openSaveModal(editingCode);
      }}
    >
      {isJapanese ? "保存" : "Save"}
    </button>

    <button
      class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
      onclick={() => {
        timerIsRunnning = false;
        codeManager.openLoadModal(isJapanese);
      }}
    >
      {isJapanese ? "ロード" : "Load"}
    </button>
  </div>
</div>
