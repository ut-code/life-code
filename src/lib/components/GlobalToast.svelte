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
  <div class="toast toast-middle toast-center">
    <div class={`alert ${alertClass} p-3 text-lg`}>
      <div>
        <span>{toast.message}</span>
      </div>
    </div>
  </div>
{/if}
