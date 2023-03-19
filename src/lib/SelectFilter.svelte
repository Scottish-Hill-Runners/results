<script>
    export let filterValue;
    export let preFilteredValues;
    let unique = Array.from(new Set($preFilteredValues)).sort();
    unique.unshift('All');
    $: uniqueValues = unique;
</script>

<select bind:value={$filterValue} on:click|stopPropagation>
    {#each uniqueValues as value}
      <option {value}>{value}</option>
    {/each}
</select>
