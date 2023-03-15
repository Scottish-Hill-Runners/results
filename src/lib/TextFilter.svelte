<script>
    export let filterValue;
</script>
  
<input id="filter-input" type="text" bind:value={$filterValue} placeholder="filter..." />
  
<style>
    input {
      width: 8rem;
    }
</style>
  