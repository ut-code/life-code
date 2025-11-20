<script lang="ts">
  let { open, isJapanese, onClose }: { open: boolean; isJapanese: boolean; onClose: () => void } =
    $props();
</script>

<dialog class="modal modal-middle z-[10000]" {open}>
  <div class="modal-box flex flex-col p-0 bg-base-100">
    <button
      class="btn btn-circle btn-error absolute right-7 top-2 z-[20000] text-lg text-white"
      onclick={onClose}
    >
      ✕
    </button>

    <div class="p-6 overflow-y-auto">
      <h2 class="font-bold text-2xl mb-4 text-primary">
        {isJapanese ? "チュートリアル" : "Tutorial"}
      </h2>
      <h3 class="font-bold text-xl mt-4 mb-2 text-secondary">
        {isJapanese ? "ライフゲームとは" : "What is Game of Life ?"}
      </h3>
      {#if isJapanese}
        <p>
          ライフゲームは、1970年にイギリスの数学者ジョン・ホートン・コンウェイが考案した、生命を模した数理モデルです。
          <br />
          格子状の盤面は生命が繁殖するフィールドで、黒いマスは生命を表します。
          <br />
          生命は細菌のコロニーをイメージして、セル （英語で”細胞”の意味） と呼ばれます。
          <br />
          セルは、周りに他のセルが丁度いい数いると、お互い助け合って生存できます。
          <br />
          また、周りのセルと交配して、新しいセルを生み出すこともできます。
          <br />
          時間が経つにつれて、セルの分布が複雑に変わってゆく様子を眺めましょう！
        </p>

        <p class="font-bold mt-4 mb-2">ライフゲームの４つのルール</p>

        <ol class="list-decimal list-inside ml-4 space-y-2">
          <p>
            各セルには「生きたセル（黒）」と「死んだセル（白）」の２つの状態があります。
            <br />
            セルは周囲8マスの他のセルの状態によって、次の世代の状態が変わります。
          </p>
          <li>
            <strong>誕生:</strong> 死んだセルの周りの生きたセルが３つの場合、そのセルは次の世代で誕生し生きたセルになります。
          </li>
          <li>
            <strong>生存:</strong> 生きたセルの周りの生きたセルが２つか３つの場合、そのセルは次の世代も生存します。
          </li>
          <li>
            <strong>過疎:</strong> 生きたセルの周りの生きたセルが１つ以下の場合、そのセルは次の世代で過疎により死んだセルになります。
          </li>
          <li>
            <strong>過密:</strong> 生きたセルの周りの生きたセルが４つ以上ある場合、そのセルは次の世代で過密により死んだセルになります。
          </li>

          <p class="mt-4 flex justify-center">
            <img
              src="/lib/help_img/rules_ja.png"
              alt="ライフゲームのルール"
              class="w-full max-w-sm rounded shadow-md"
            />
          </p>

          <p>
            このルールは B3/S23 と簡略化して呼ばれます。
            <br />
            B3は誕生（Born）条件が３つの生きたセル、S23は生存（Survive）条件が２つまたは３つの生きたセルという意味です。
          </p>
        </ol>
      {:else}
        <p>
          The Game of Life is a mathematical model simulating life, devised by the British
          mathematician John Horton Conway in 1970.
          <br />
          The grid-like board is a field where life propagates, and the black squares represent living
          entities.
          <br />
          These entities are called cells, conceived as a colony of bacteria.
          <br />
          A cell can survive by mutual assistance if a suitable number of other cells are present around
          it.
          <br />
          It can also crossbreed with neighboring cells to create new ones.
          <br />
          Let's observe how the distribution of cells changes and grows more complex over time!
        </p>

        <p class="font-bold mt-4 mb-2">The Four Rules of Life Game</p>

        <ol class="list-decimal list-inside ml-4 space-y-2">
          <p>
            Each cell has two states: "alive (black)" and "dead (white)".
            <br />
            A cell's state in the next generation changes depending on the state of the other cells in
            its surrounding 8 squares.
          </p>
          <li>
            <strong>Birth:</strong> A dead cell becomes an alive cell in the next generation if it has
            3 alive neighbors.
          </li>
          <li>
            <strong>Survival:</strong> An alive cell survives into the next generation if it has 2 or
            3 alive neighbors.
          </li>
          <li>
            <strong>Underpopulation:</strong> An alive cell dies due to underpopulation in the next generation
            if it has 1 or fewer alive neighbors.
          </li>
          <li>
            <strong>Overpopulation:</strong> An alive cell dies due to overpopulation in the next generation
            if it has 4 or more alive neighbors.
          </li>

          <p class="mt-4 flex justify-center">
            <img
              src="/help-images/rules_en.png"
              alt="Game of Life Rules"
              class="w-full max-w-sm rounded shadow-md"
            />
          </p>

          <p>
            This set of rules is often called B3/S23 in shorthand.
            <br />
            B3 means the Born condition requires 3 alive neighbors, and S23 means the Survive condition
            requires 2 or 3 alive neighbors.
          </p>
        </ol>
      {/if}

      <div class="divider"></div>

      <h3 class="font-bold text-xl mt-4 mb-2 text-secondary">
        {isJapanese ? "画面の構成と操作方法" : "Screen Layout and Operation"}
      </h3>

      {#if isJapanese}
        <p class="mt-4 flex justify-center">
          <img
            src="/lib/help_img/ui_map_ja.png"
            alt="画面の見方"
            class="w-full max-w-sm rounded shadow-md"
          />
        </p>

        <h4 class="font-bold mt-4 mb-2">画面の構成</h4>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li>
            <strong>中央の盤面:</strong> セルが繁殖するフィールドです。クリックまたはドラッグでセルの状態を変更できます。
          </li>
          <li>
            <strong>右側のコードエディタ:</strong> ライフゲームのロジックを制御するJavaScriptコードが表示されています。独自のルールを作成・適用できます。
          </li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">シミュレーション制御:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li><strong>世代数:</strong> 現在のシミュレーションのステップ数が表示されます。</li>
          <li>
            <strong>速度コントロール（減速/x1/加速）:</strong> シミュレーションの進行速度を調整します。
          </li>
          <li><strong>再生/一時停止:</strong> シミュレーションを開始・停止します。</li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">盤面の操作:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li>
            <strong>保存/ロード:</strong> 盤面を保存して他のユーザーに公開することや、他のユーザーが作成した盤面を読み込むことが可能です。
          </li>
          <li>
            <strong>リセット/ランダム</strong> 盤面の状態をリセットしたり、セルをランダムに配置することができます。
          </li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">コードエディタの操作:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li><strong>適用:</strong> 編集中のコードをシミュレーションに反映します。</li>
          <li>
            <strong>保存/ロード:</strong> 現在適用されているコードを保存して他のユーザーに公開することや、他のユーザーが作成したコードを読み込むことが可能です。
          </li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">テンプレート/ルール選択:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li>
            <strong>テンプレート:</strong> ライフゲームでは面白い振る舞いをする有名なパターンがいくつも見つかっており、テンプレートボタンでは、それらのパターンを盤面に配置することができます。
          </li>
          <li>
            <strong>ルール選択:</strong> ut.code();のチームが作成したライフゲームのルールで遊べます。
          </li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">画面右上のアイコン:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li><strong>リセットアイコン:</strong> 編集したコードを初期状態に戻します。</li>
          <li><strong>コードアイコン:</strong> コードエディタの表示・非表示を切り替えます。</li>
          <li><strong>疑問符アイコン:</strong> このヘルプ画面をいつでも再表示できます。</li>
          <li><strong>言語アイコン:</strong> 表示言語（日本語/英語）を切り替えます。</li>
        </ul>
      {:else}
        <p class="mt-4 flex justify-center">
          <img
            src="/help-images/ui_map_en.png"
            alt="Screen Guide"
            class="w-full max-w-sm rounded shadow-md"
          />
        </p>

        <h4 class="font-bold mt-4 mb-2">Screen Layout</h4>
        <ul class="list-disc list-inside ml-4 space-y-1">
          <li>
            <strong>Center Board:</strong> This is the field where cells propagate. Click or drag to
            change a cell's state.
          </li>
          <li>
            <strong>Right Code Editor:</strong> Displays the JavaScript code controlling the Game of
            Life logic. You can create and apply your own rules.
          </li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">Simulation Control:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li><strong>Generation:</strong> Shows the current simulation step count.</li>
          <li>
            <strong>Speed Control (Decelerate/x1/Accelerate):</strong> Adjusts the simulation speed.
          </li>
          <li><strong>Play/Pause:</strong> Starts or stops the simulation.</li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">Board Operations:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li>
            <strong>Save/Load:</strong> You can save the board state and share it with other users, or
            load boards created by others.
          </li>
          <li>
            <strong>Reset/Random:</strong> You can reset the board state or arrange cells randomly.
          </li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">Code Editor Operations:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li>
            <strong>Apply:</strong> Applies the code currently being edited to the simulation.
          </li>
          <li>
            <strong>Save/Load:</strong> You can save the currently applied code and share it with other
            users, or load code created by others.
          </li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">Template/Rule Selection:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li>
            <strong>Template:</strong> Several famous patterns exhibiting interesting behavior in the
            Game of Life have been discovered. The template button allows you to place these patterns
            on the board.
          </li>
          <li>
            <strong>Select Rule:</strong> Allows you to play with custom Game of Life rules created by
            the ut.code(); team.
          </li>
        </ul>

        <h4 class="font-bold mt-4 mb-2">Top Right Icons:</h4>
        <ul class="list-disc list-inside ml-8 space-y-1">
          <li><strong>Reset Icon:</strong> Reverts the edited code back to its initial state.</li>
          <li><strong>Code Icon:</strong> Toggles the display of the code editor.</li>
          <li><strong>Questionmark Icon:</strong> Reopens this help screen at any time.</li>
          <li><strong>Language Icon:</strong> Toggles the display language (Japanese/English).</li>
        </ul>
      {/if}

      <p class="mt-8 text-sm italic text-center text-gray-500">
        {isJapanese
          ? "さあ、あなただけのライフゲームを作って遊びましょう！"
          : "Enjoy creating your own game of life!"}
      </p>
    </div>
  </div>
</dialog>

<style>
  .modal-box {
    width: 90vw;
    max-width: 90vw;
    height: 90vh;
    max-height: 90vh;
  }
</style>
