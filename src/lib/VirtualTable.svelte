<script lang="ts">
  import Link from '$lib/Link.svelte';
  import { createEventDispatcher } from 'svelte';
  import SortDirection from "$lib/SortDirection.svelte";
  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';

  type T = $$Generic;

  export let items: T[];
  export let columns: { [key: string]: ColumnSpec<T> };

  const dispatch = createEventDispatcher();

  type SortKey = { [key: string]: "asc" | "desc" };
  let sortKey = {} as SortKey;
  for (const [key, value] of Object.entries(columns))
    if (value.sort) sortKey[key] = value.sort;

  const stickySortKeys =
    Object.entries(columns).flatMap(([key, value]) => value.sticky ? [key] : []);

  const ascOnlySortKeys =
    Object.entries(columns).flatMap(([key, value]) => value.ascOnly ? [key] : []);

  const sortBy = (key: string) => {
    const current = sortKey[key];
    if (stickySortKeys.includes(key))
		  delete sortKey[key];
    else
		  sortKey = {} as SortKey;
    if (current == undefined)
		  sortKey = { [key]: "asc", ...sortKey };
    else if (current == "asc" && !ascOnlySortKeys.includes(key))
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
      <TableBodyRow on:click={() => dispatch('select-row', item)}>
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
    <TableBodyRow>
      {#if items.length > visible.length}
        <TableHeadCell
          class="text-center"
          colspan={Object.keys(columns).length}
          on:click={() => nRows += 20}>
          Show more rows ({items.length - visible.length} hidden)
        </TableHeadCell>
      {:else}
        <TableHeadCell colspan={Object.keys(columns).length}>
          <img
            class="mx-auto"
            alt=""
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='377.845' height='12.488'%3E%3Cdefs%3E%3CclipPath id='A'%3E%3Cpath d='M283.47 9.366H0V0h283.47z'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg clip-path='url(%23A)' transform='matrix(1.333333 0 0 -1.333333 -.000024 12.487852)' stroke='%23000' stroke-width='.399' stroke-miterlimit='10'%3E%3Cpath d='M113.4 7.448c-1.907 0-3.452-1.302-3.492-2.922h-1.339c-2.161 0-6.356 2.922-6.356 2.922-4.277-2.261-22.62-3.035-23.002-3.048H.571C.257 4.4 0 4.142 0 3.825a.57.57 0 0 1 .572-.569h78.504c15.509-.258 23.9-2.036 23.9-2.036 1.664 2.109 5.262 2.572 6.997 2.651.32-1.368 1.733-2.4 3.428-2.4 1.931 0 3.496 1.342 3.496 2.988 0 1.653-1.565 2.988-3.496 2.988zM102.086 1.98s-7.882 1.778-14.493 1.911c0 0 10.17.509 14.111 2.413 0 0 2.798-1.778 3.942-2.162 0 0-2.798-1.269-3.56-2.162zm11.12.383c-1.051 0-1.903.879-1.903 1.97s.852 1.97 1.903 1.97 1.904-.879 1.904-1.97-.852-1.97-1.904-1.97zM282.614 4.4h-78.643c-.381.013-18.723.787-23.001 3.048 0 0-4.195-2.922-6.356-2.922h-1.337c-.042 1.62-1.589 2.922-3.493 2.922-1.931 0-3.497-1.335-3.497-2.988 0-1.646 1.566-2.988 3.497-2.988 1.696 0 3.108 1.031 3.428 2.4 1.734-.079 5.332-.542 6.996-2.651 0 0 8.39 1.778 23.901 2.03l78.506.007c.315 0 .57.251.57.569s-.255.575-.57.575zM169.976 2.364c-1.05 0-1.903.879-1.903 1.97s.853 1.97 1.903 1.97 1.903-.879 1.903-1.97-.852-1.97-1.903-1.97zm11.122-.383c-.764.892-3.561 2.162-3.561 2.162 1.144.383 3.942 2.162 3.942 2.162 3.941-1.904 14.111-2.413 14.111-2.413-6.61-.132-14.492-1.911-14.492-1.911zm-53.055 3.04c2.549-1.884 7.617-.621 11.674 1.157a105.02 105.02 0 0 0 7.882 3.048c-2.289.767-7.556-2.215-12.967-3.815-4.718-1.395-6.387-.516-6.588-.39zm27.563-.912c-.668.668-2.835 1.375-7.246-.093L139.97.87c3.719-.383 4.672 1.236 9.536 2.763 4.39 1.382 6.101.476 6.101.476zm2.426 5.15c-5.025.364-9.284-1.448-13.401-3.2l-1.782-.754c-4.286-1.825-10.157-4.324-15.542-4.152-4.92.159-7.741 1.448-7.741 3.53 0 1.825 1.747 2.882 5.192 3.147 3.462.271 6.465-1.785 6.495-1.805a.57.57 0 1 1 .654.938c-.135.093-3.358 2.307-7.236 2.01-5.165-.397-6.249-2.552-6.249-4.291 0-1.639 1.15-4.423 8.849-4.674 5.637-.178 11.367 2.01 15.75 3.881l1.78.754c3.994 1.699 8.399 3.815 13.147 3.471 5.615-.403 6.335-2.201 6.335-3.715 0-.443-.168-.82-.514-1.15-.922-.899-3.021-1.408-5.475-1.329-2.981.086-5.207.945-5.236.959a.57.57 0 0 1-.765-.264c-.137-.284-.018-.628.266-.767.126-.06 2.468-.972 5.699-1.071 2.796-.086 5.154.529 6.307 1.653.572.549.861 1.216.861 1.97 0 2.948-2.349 4.495-7.395 4.859z'/%3E%3C/g%3E%3C/svg%3E" />
        </TableHeadCell>
      {/if}
    </TableBodyRow>
  </TableBody>
</Table>
