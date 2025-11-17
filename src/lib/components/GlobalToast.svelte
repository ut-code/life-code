<script lang="ts">
  import { toast } from "$lib/models/ToastStore.svelte";

  let alertClass: string = $derived.by(() => {
    switch (toast.type) {
      case "success":
        return "alert-success";
      case "error":
        return "alert-error";
      default:
        return "alert-info";
    }
  });
</script>

{#if toast.visible}
  <!-- 最前面に配置 -->
  <div class="toast toast-middle toast-center z-[9999]">
    <div class={`alert ${alertClass} p-3 text-lg`}>
      <div>
        <span>{toast.message}</span>
      </div>
    </div>
  </div>
{/if}
