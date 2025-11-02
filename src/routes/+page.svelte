<script lang="ts">
  import * as icons from "$lib/icons/index.ts";
  import lghtml from "../life-game/life-game.html?raw";
  import lgjs from "../life-game/life-game.js?raw";
  import placetemplate from "../life-game/place_template.js?raw";
  // @ts-expect-error -- for jsfile import
  import patterns from "../life-game/life-game_template.js";
  import { onMount } from "svelte";
  import event from "../life-game/event.js?raw";

  let code = $state(lgjs);

  let previewDoc = $derived(
    lghtml.replace(
      /<script src="\.\/life-game\.js"><\/script>/,
      `<script>
      \n${event}\n
      \n${lgjs}\n
      \n${placetemplate}\n
      <\/script>`,
    ),
  );

  let showEditor = $state(true);
  let preview_iframe: HTMLIFrameElement | undefined = $state();
  let isProgress = $state(false);
  let drawerOpen = $state(false);
  let resetModalOpen = $state(false);
  let bottomDrawerOpen = $state(false);

  let generationFigure = $state(0);

  onMount(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "patternError") {
        alert(event.data.message);
      }
      if (event.data.type === "generation_change") {
        generationFigure = event.data.data;
      }
    });
  });

  function sendEvent(event: string, message?: unknown) {
    preview_iframe?.contentWindow?.postMessage({ type: event, data: message }, "*");
  }
</script>

<div class="navbar bg-[#E0E0E0] shadow-sm">
  <button
    class="btn btn-sm btn-ghost btn-circle bg-[#E0E0E0] mx-5 w-8 rounded border-none"
    onclick={() => {
      drawerOpen = !drawerOpen;
    }}
  >
    <img src={icons.bars_3} alt="settings" />
  </button>

  <div class="mx-5 avatar w-8 rounded">
    <img src={icons.utcode} alt="ut.code();_Logo" />
  </div>

  <div class="font-semibold text-black text-[20px]">Life code</div>

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
      {#each Object.keys(patterns) as patternName (patternName)}
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

<div class="flex h-screen box-border">
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
      class="w-[90%] h-[80%] rounded-lg m-auto shadow-lg"
    ></iframe>
  </div>

  <div
    class={[
      "flex box-border bg-white shrink-0 overflow-hidden transition-[flex-basis,opacity] duration-300 ease-in-out",
      showEditor ? "basis-[40%] opacity-100" : "basis-0 opacity-0",
    ]}
  >
    <textarea bind:value={code} class="w-full h-full border-none p-4 font-mono bg-black text-[#0f0]"
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

  <div class="font-bold text-black ml-20">
    第 {generationFigure} 世代
  </div>

  <button
    class="btn btn-ghost hover:bg-[rgb(220,220,220)] ml-10 text-black"
    onclick={() => {
      sendEvent("boardreset");
    }}
  >
    Reset
  </button>

  <button
    class="btn btn-ghost hover:bg-[rgb(220,220,220)] text-black"
    onclick={() => {
      sendEvent("boardrandom");
    }}
  >
    Random
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
</div>
