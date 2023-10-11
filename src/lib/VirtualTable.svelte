<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Input } from "flowbite-svelte";
  import Link from '$lib/Link.svelte';
  import SortDirection from "$lib/SortDirection.svelte";

  type T = $$Generic;

  export let items: T[];
  export let itemHeight: number = 30;
  export let columns: { [key: string]: ColumnSpec<T> };
  export let searchTerm = "";

  type SortKey = { [key: string]: "asc" | "desc" };
  let sortKey = {} as SortKey;
  for (const [key, value] of Object.entries(columns)) {
    if (value.sort) sortKey[key] = value.sort;
    if (!value.width) // TODO: Include header widths
      value.width =
        items.length == 0
        ? "auto"
        : Math.max(...items.slice(0, 20).map((item) => ("" + item[key]).length)) + "ch";
  }

  const stickySortKeys =
    Object.entries(columns).flatMap(([key, value]) => value.sticky ? [key] : []);

  const sortBy = (key: string) => {
    scrollTop = 0;
    const current = sortKey[key];
    if (stickySortKeys.includes(key))
		  delete sortKey[key];
    else
		  sortKey = {} as SortKey;
    if (current == undefined)
		  sortKey = { [key]: "asc", ...sortKey };
    else if (current == "asc")
		  sortKey = { [key]: "desc", ...sortKey };
    else
		  sortKey = { ...sortKey };
  };

  function compare(order: SortKey): (a: T, b: T) => number {
    return (a, b) => {
      for (const [key, dir] of Object.entries(order)) {
				let cmp = 0;
        if (columns[key].cmp)
				  cmp = columns[key].cmp(a, b);
				else {
        	let aVal = a[key];
        	let bVal = b[key];
          cmp =
            typeof aVal == "number" && typeof bVal == "number"
							? aVal - bVal
							: typeof aVal == "string" && typeof bVal == "string"
							? aVal.localeCompare(bVal, undefined, { sensitivity: "base" })
							: 0;
				}

        if (cmp != 0) return cmp * (dir == "asc" ? 1 : -1);
      }

      return 0;
    };
  }

  let scrollTop = 0;
  let header: HTMLElement;
  let grid: HTMLElement;
  let frame: number;
  let startIndex: number;

  function poll() {
    scrollTop = grid?.scrollTop;
    frame = requestAnimationFrame(poll);
  }

  onMount(() => frame = requestAnimationFrame(poll));
  onDestroy(() => typeof('cancelAnimationFrame') === 'function' && cancelAnimationFrame(frame));

  let filtered = items;
  let visible = filtered;
  $: {
    const lcSearch = searchTerm.toLowerCase();
    const cmp = compare(sortKey);
    filtered =
     items
      .filter(
        (item) =>
          Object.entries(item).some(
            ([key, value]) =>
              columns[key]?.searchable &&
              (value ?? "").toLowerCase().indexOf(lcSearch) != -1))
      .sort(cmp);
  }

  const templateColumns = Object.values(columns).map(col => col.width).join(" ");
  $: {
    startIndex = Math.floor(scrollTop / itemHeight);
    if (header)
      header.style.setProperty('--grid-template-columns', templateColumns);
    if (grid) {
      const gridHeight = grid.clientHeight;
      const numItems = Math.ceil(gridHeight / itemHeight);
      grid.style.setProperty('--grid-end-row', `${startIndex + numItems + 1}`);
      grid.style.setProperty('--grid-height', "100vh");
      grid.style.setProperty('--grid-item-height', `${itemHeight}px`);
      grid.style.setProperty('--grid-leading-height', `${startIndex * itemHeight}px`);
      grid.style.setProperty('--grid-row-count', `${filtered.length + 1}`);
      grid.style.setProperty('--grid-start-row', `${startIndex + 1}`);
      grid.style.setProperty('--grid-template-columns', templateColumns);
      grid.style.setProperty('--grid-trailing-height', `${filtered.length * itemHeight - gridHeight - scrollTop}px`);
      visible = filtered.slice(startIndex, startIndex + numItems + 1);
    }
  }
</script>

<Input bind:value={searchTerm} placeholder="Search..." />

<div class="header" bind:this={header}>
  {#each Object.entries(columns) as [key, value], i}
    <div
      class="th"
      on:click={() => sortBy(key)}
      on:keydown={() => sortBy(key)}
      role="button"
      aria-roledescription="sort"
      tabindex={i}>
      {value.header}<SortDirection dir={sortKey[key]} />
    </div>
  {/each}
</div>

<div class="grid-scroller" bind:this={grid}>
  {#if startIndex != 0}
    <div class="leading" />
  {/if}
  {#each visible as item, i}
    <div class="tr">
      {#each Object.entries(columns) as [key, value]}
        <div class={(i + startIndex) % 2 == 0 ? "td even" : "td"}>
          {#if value.link}
            <Link {...value.link(item)} />
          {:else if value.display}
            {value.display(item)}
          {:else}
            {item[key]}
          {/if}
        </div>
      {/each}
    </div>
  {/each}
  <div class="trailing" />
</div>

<style>
  :root {
    --grid-end-row: inherit;
    --grid-height: inherit;
    --grid-item-height: inherit;
    --grid-leading-height: inherit;
    --grid-row-count: inherit;
    --grid-start-row: inherit;
    --grid-template-columns: inherit;
    --grid-trailing-height: inherit;
  }

  .header {
    display: grid;
    grid-template-columns: var(--grid-template-columns);
    width: 100%;
  }

  .tr {
    display: contents;
  }

  .th {
    background-color: lightgray;
  }

  .grid-scroller {
    overflow-y: scroll;
    display: grid;
    grid-template-columns: var(--grid-template-columns);
    grid-template-rows: var(--grid-item-height);
    width: 100%;
    height: var(--grid-height);
  }

  .td {
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .even {
    background: #e2e0e9;
  }
  
  .leading {
    grid-column: 1 / -1;
    grid-row: 1 / var(--grid-start-row);
    height: var(--grid-leading-height);
  }

  .trailing {
    grid-column: 1 / -1;
    grid-row: var(--grid-end-row) / var(--grid-row-count);
    height: var(--grid-trailing-height);
  }
</style>
