export class ToastStore {
  message = $state("");
  type = $state<"success" | "error" | "info">("info");
  visible = $state(false);

  private timerId: ReturnType<typeof setTimeout> | undefined = $state(undefined);

  /**
   * トーストを表示する
   * @param message 表示するメッセージ
   * @param type "success" | "error" | "info"
   * @param duration 表示時間（ミリ秒）
   */
  show(message: string, type: "success" | "error" | "info" = "info", duration: number = 2000) {
    this.message = message;
    this.type = type;
    this.visible = true;

    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    this.timerId = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide() {
    this.visible = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
  }
}

// グローバルで使うための単一インスタンスを作成してエクスポート
export const toast = new ToastStore();
