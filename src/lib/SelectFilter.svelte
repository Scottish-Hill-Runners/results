<script>
    export let filterValue;
    export let preFilteredValues;
    $: uniqueValues = Array.from(new Set($preFilteredValues)).sort();
</script>

<select bind:value={$filterValue} on:click|stopPropagation>
    <option value={undefined}>All</option>
    {#each uniqueValues as value}
      <option {value}>{value}</option>
    {/each}
</select>
