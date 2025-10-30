<script lang="ts">
  import * as icons from "$lib/icons/index.ts";
  import lghtml from "../life-game/life-game.html?raw";
  import lgjs from "../life-game/life-game.js?raw";
  import Event from "../life-game/event.js?raw";

  let code = $state(lgjs);

  let previewDoc = $derived(
    lghtml.replace(
      /<script src="\.\/life-game\.js"><\/script>/,
      `<script>
      \n${Event}\n
      \n${lgjs}\n
      <\/script>`,
    ),
  );

  let showEditor = $state(true);
  let preview_iframe: HTMLIFrameElement | undefined = $state();
  let isProgress = $state(false);

  function sendEvent(event: any, message?: any) {
    preview_iframe?.contentWindow?.postMessage({ type: event }, message ? message : "*");
  }
</script>

<div class="navbar bg-[#E0E0E0] shadow-sm">
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
      const eventName = isProgress ? "pause" : "play";
      sendEvent(eventName);
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
