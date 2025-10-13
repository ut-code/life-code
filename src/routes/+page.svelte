<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<div class="min-h-screen bg-base-200 p-8">
  <div class="max-w-4xl mx-auto space-y-8">
    
    <!-- ヘッダー -->
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold text-primary">TailwindCSS & DaisyUI テスト</h1>
      <p class="text-lg text-base-content/70">すべての要素が正しく表示されていれば、正常に動作しています</p>
    </div>

    <!-- TailwindCSS基本テスト -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl">✅ TailwindCSS 基本クラス</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="w-20 h-20 bg-red-500 rounded"></div>
            <div class="w-20 h-20 bg-blue-500 rounded-lg"></div>
            <div class="w-20 h-20 bg-green-500 rounded-full"></div>
            <div class="w-20 h-20 bg-yellow-500"></div>
          </div>
          <p class="text-sm text-base-content/70">色付きの正方形が4つ表示されていればTailwindCSS動作中</p>
        </div>
      </div>
    </div>

    <!-- DaisyUI ボタンテスト -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl">✅ DaisyUI ボタン</h2>
        <div class="flex flex-wrap gap-2">
          <button class="btn">Default</button>
          <button class="btn btn-primary">Primary</button>
          <button class="btn btn-secondary">Secondary</button>
          <button class="btn btn-accent">Accent</button>
          <button class="btn btn-info">Info</button>
          <button class="btn btn-success">Success</button>
          <button class="btn btn-warning">Warning</button>
          <button class="btn btn-error">Error</button>
        </div>
        <p class="text-sm text-base-content/70">カラフルなボタンが表示されていればDaisyUI動作中</p>
      </div>
    </div>

  </div>
</div>