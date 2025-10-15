<script>
  let code = 
`<!DOCTYPE html>
<html>
<body>
  <h1>Life Game</h1>
  <script>
    console.log('実行されました');
  <\/script>
</body>
</html>`;

  let previewDoc = code;
  let showEditor = true;
  
  function updatePreview() {
    previewDoc = code;
  }
</script>

<div class="navbar bg-[#E0E0E0] shadow-sm">
  <div class="mx-5 avatar w-8 rounded">
    <img
      src="prepare_it_later"
      alt="ut.code();_Logo"
    />
  </div>
  
  <div class="font-semibold text-black text-[20px]">Life code</div>

  <div class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap ml-20">
    <svg class="size-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  </div>

  <label class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap ml-5">
    <input type="checkbox" />
    <svg class="size-6 swap-on text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
    <svg class="size-6 swap-off text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
  </label>

  <div class="btn btn-ghost btn-circle hover:bg-[rgb(220,220,220)] swap ml-5">
    <svg class="size-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  </div>

  <label class="swap ml-auto mr-5">
    <input type="checkbox" bind:checked={showEditor} />
    <div class="text-black">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    </div>
  </label>
</div>

<div class="flex h-screen box-border">
  <div class="flex overflow-hidden bg-[rgb(202,202,202)] shrink-0 transition-[flex-basis] duration-300 ease-in-out {showEditor ? 'basis-[60%]' : 'basis-full'}">
    <iframe 
      srcdoc={previewDoc} 
      title="Preview" 
      sandbox="allow-scripts"
      class="w-[90%] h-[80%] rounded-lg m-auto shadow-lg"
    ></iframe>
  </div>

  <div class="flex box-border bg-white shrink-0 overflow-hidden transition-[flex-basis,opacity] duration-300 ease-in-out {showEditor ? 'basis-[40%] opacity-100' : 'basis-0 opacity-0'}">
    <textarea 
      bind:value={code} 
      on:input={updatePreview}
      class="w-full h-full border-none p-4 font-mono bg-black text-[#0f0]"
    ></textarea>
  </div>
</div>