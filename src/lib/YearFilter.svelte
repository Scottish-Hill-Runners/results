<script lang="ts">
  import type { Readable } from 'svelte/store';
  export let filterValue: Readable<string>;
  export let preFilteredValues: Readable<string[]>;
  let unique = Array.from(new Set($preFilteredValues)).sort();
  unique.unshift('All', 'All*');
  $: uniqueValues = unique;
</script>

<select bind:value={$filterValue} on:click|stopPropagation>
  {#each uniqueValues as value}
    <option {value}>{value}</option>
  {/each}
</select>
