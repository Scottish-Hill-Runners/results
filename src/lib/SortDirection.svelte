<script lang="ts">
  import { ArrowKeyUp, ArrowKeyDown } from 'flowbite-svelte';
  export let dir: "asc" | "desc";
</script>

{#if dir == "asc"}
  <ArrowKeyDown />
{:else if dir == "desc"}
  <ArrowKeyUp />
{/if}
