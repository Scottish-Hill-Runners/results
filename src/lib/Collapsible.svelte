<script lang="ts">
  export let header: string;
  export let expanded: boolean;
</script>

<div class="collapsible">
  <button aria-expanded={expanded} on:click={() => expanded = !expanded}>
    {@html header} (click {#if !expanded}for details{:else}to hide{/if})
  </button> 
  <div hidden={!expanded}>
      <slot />
  </div>
</div>

<style>
  button {
    display: flex;
    border: none;
    margin: 0;
    padding: 0.5em 0em;
  }
</style>