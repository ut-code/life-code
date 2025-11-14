<script lang="ts">
  import { toast } from "$lib/models/ToastStore.svelte";

  // toast.type に応じて DaisyUI の alert-success などを出し分ける
  function getAlertClass(type: string) {
    switch (type) {
      case "success":
        return "alert-success";
      case "error":
        return "alert-error";
      default:
        return "alert-info";
    }
  }
</script>

{#if toast.visible}
  <div class="toast toast-middle toast-center">
    <div class={`alert ${getAlertClass(toast.type)} p-3 text-lg`}>
      <div>
        <span>{toast.message}</span>
      </div>
    </div>
  </div>
{/if}
