<script lang="ts">
  import Link from '$lib/Link.svelte';
  import SortDirection from "$lib/SortDirection.svelte";
  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';

  type T = $$Generic;

  export let items: T[];
  export let columns: { [key: string]: ColumnSpec<T> };

  type SortKey = { [key: string]: "asc" | "desc" };
  let sortKey = {} as SortKey;
  for (const [key, value] of Object.entries(columns))
    if (value.sort) sortKey[key] = value.sort;

  const stickySortKeys =
    Object.entries(columns).flatMap(([key, value]) => value.sticky ? [key] : []);

  const sortBy = (key: string) => {
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

  $: nRows = 20;
  $: sorted = items.sort(compare(sortKey));
  $: visible = sorted.slice(0, nRows);
</script>

<Table striped={true}>
  <TableHead>
    {#each Object.entries(columns) as [key, value]}
    <TableHeadCell on:click={() => sortBy(key)}>
      {value.header}<SortDirection dir={sortKey[key]} />
    </TableHeadCell>
    {/each}
  </TableHead>
  <TableBody>
    {#each visible as item}
      <TableBodyRow>
        {#each Object.entries(columns) as [key, value]}
          <TableBodyCell>
            {#if value.link}
              <Link {...value.link(item)} />
            {:else if value.display}
              {value.display(item)}
            {:else}
              {item[key]}
            {/if}
          </TableBodyCell>
        {/each}
      </TableBodyRow>
    {/each}
    {#if items.length > visible.length}
    <TableBodyRow>
      <TableHeadCell
        class="text-center"
        colspan={Object.keys(columns).length}
        on:click={() => nRows += 20}>
        Show more rows ({items.length - visible.length} hidden)
      </TableHeadCell>
    </TableBodyRow>
    {/if}
  </TableBody>
</Table>
