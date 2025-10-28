<script lang="ts">
  import * as icons from "$lib/icons/index.ts";
  import lghtml from "../life-game/life-game.html?raw";
  import lgjs from "../life-game/life-game.js?raw";
  import PlayandPause from "../life-game/play-pause.js?raw";

  let code = $state(lgjs);

  let previewDoc = $derived(
    lghtml.replace(
      /<script src="\.\/life-game\.js"><\/script>/,
      `<script>
      \n${lgjs}\n
      \n${PlayandPause}\n
      <\/script>`,
    ),
  );

  let showEditor = $state(true);
  let preview_iframe: HTMLIFrameElement | undefined = $state();
  let isProgress = $state(false);
  let drawerOpen = $state(false);
  let languageOpen = $state(false);
  let resetModalOpen = $state(false);
  let bottomDrawerOpen = $state(false);
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

  <div class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap ml-20">
    <img class="size-6" src={icons.LeftArrow} alt="Left Arrow" />
  </div>

  <button
    class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap ml-5"
    onclick={() => {
      preview_iframe?.contentWindow?.postMessage({ type: isProgress ? "pause" : "play" }, "*");
      isProgress = !isProgress;
    }}
  >
    <input type="checkbox" bind:checked={isProgress} />
    <img class="size-6 swap-on" src={icons.Pause} alt="Pause" />
    <img class="size-6 swap-off" src={icons.Play} alt="Play" />
  </button>

  <div class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap ml-5">
    <img class="size-6" src={icons.RightArrow} alt="Right Arrow" />
  </div>

  <label class="swap ml-auto mr-5">
    <input type="checkbox" bind:checked={showEditor} />
    <div class="text-black">
      <img class="size-6" src={icons.CodeBracket} alt="Code Bracket" />
    </div>
  </label>
</div>

<div class="drawer z-50">
  <input type="checkbox" class="drawer-toggle" bind:checked={drawerOpen} />

  <div class="drawer-side">
    <label class="drawer-overlay" onclick={() => (drawerOpen = false)}></label>
    <div class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
      <h2 class="text-xl font-bold mb-4">Settings</h2>
      <ul>
        <li>
          <button class="text-left w-full" onclick={() => (languageOpen = !languageOpen)}>
            Language
          </button>
          <ul class="ml-4" class:hidden={!languageOpen}>
            <li><button class="text-left">日本語</button></li>
            <li><button class="text-left">English</button></li>
          </ul>
        </li>
        <li><button class="text-left">empty</button></li>
        <li>
          <button class="text-left text-red-500" onclick={() => (resetModalOpen = true)}
            >Reset</button
          >
        </li>
      </ul>
    </div>
  </div>
</div>

<button
  class="btn fixed bottom-0 left-0 z-50 rounded-none"
  onclick={() => (bottomDrawerOpen = !bottomDrawerOpen)}
>
  {bottomDrawerOpen ? "▼" : "▲ テンプレート"}
</button>

<div
  class="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300"
  class:translate-y-full={!bottomDrawerOpen}
  class:translate-y-0={bottomDrawerOpen}
>
  <div class="bg-base-200 shadow-lg p-4 h-64 w-full">
    <h2 class="text-xl font-bold mb-4">下からのバー</h2>
    <p>ここにコンテンツ</p>
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
