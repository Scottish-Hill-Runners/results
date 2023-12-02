<script lang="ts">
  import "../app.postcss";
  import { navigating } from "$app/stores";
  import { Spinner } from "flowbite-svelte";
</script>

{#if $navigating}
  <div class="center">
    <div role="status">
      <Spinner />
      <span class="sr-only">Loading...</span>
    </div>
  </div>
{:else}
<div>
  <slot />
</div>
{/if}

<style>
  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
