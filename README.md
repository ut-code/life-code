# Life Code

第76回駒場祭企画 C 班

## 開発

### 環境構築

インストール:

- Bun >= v1.2 <https://bun.com/>

実行:

```sh
bun install --frozen-lockfile
```

### コマンド

```sh
bun dev # 開発用サーバーを起動
bun run build # リリース用にビルド

bun check # 型チェック (TypeScript)
bun lint # コードの品質・整形チェック
bun format # コードを自動で整形
```

### コミットする前に

以下のコマンドを実行して型チェックとコードの整形をしましょう。

```sh
bun check # 型チェック
bun format # コード整形
bun lint # 品質チェック
```

### 学習用教材・リファレンス

- Svelte v5・SvelteKit <https://svelte.jp/docs>
- DaisyUI v5 <https://daisyui.com/components/>
- TailwindCSS v4 <https://tailwindcss.com/>
