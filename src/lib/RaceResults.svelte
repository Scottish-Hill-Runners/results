<script lang="ts">
    import { readable } from 'svelte/store';
    import { createRender, createTable, Render, Subscribe } from 'svelte-headless-table';
    import { addSortBy, addColumnOrder, addColumnFilters, addPagination } from 'svelte-headless-table/plugins';
    import TextFilter from "$lib/TextFilter.svelte";
    import SelectFilter from "$lib/SelectFilter.svelte";
  
    export let results: Result[];
    export let title: string;
    export let blurb: string;

    const textFilterPlugin = {
      filter: {
        fn: ({ filterValue, value }) => String(value).toLowerCase().startsWith(String(filterValue).toLowerCase()),
        initialFilterValue: '',
        render: ({ filterValue, values, preFilteredValues }) =>
          createRender(TextFilter, { filterValue, values, preFilteredValues }),
      }
    };
    const matchFilterPlugin = {
      filter: {
        fn: ({ filterValue, value }) => filterValue === undefined || filterValue === value,
        render: ({ filterValue, preFilteredValues }) =>
          createRender(SelectFilter, { filterValue, preFilteredValues }),
      }
    };

    const data = readable(results);
    const table =
      createTable(
        data, {
          sort: addSortBy({ disableMultiSort: true }),
          colOrder: addColumnOrder(),
          page: addPagination(),
          filter: addColumnFilters()
        });
    const columns =
      table.createColumns([
        table.column({header: 'Year', accessor: 'year', plugins: matchFilterPlugin}),
        table.column({header: 'Pos', accessor: 'position'}),
        table.column({header: 'Forename', accessor: 'forename', plugins: textFilterPlugin}),
        table.column({header: 'Surname', accessor: 'surname', plugins: textFilterPlugin}),
        table.column({header: 'Club', accessor: 'club', plugins: matchFilterPlugin}),
        table.column({header: 'Cat.', accessor: 'category', plugins: matchFilterPlugin}),
        table.column({header: 'Time', accessor: 'time'})
      ]);
    const {
      visibleColumns,
      headerRows,
      pageRows,
      tableAttrs,
      tableBodyAttrs,
      pluginStates
    } =
      table.createViewModel(
        columns, {
          sort: addSortBy(),
          filter: addColumnFilters()
       });
    const { filterValues } = pluginStates.filter;
    const { pageIndex, pageCount, pageSize, hasNextPage, hasPreviousPage } = pluginStates.page;
    const { columnIdOrder } = pluginStates.colOrder;
    $columnIdOrder = ['year', 'position'];
</script>

<h1>{title}</h1>

{@html blurb}

<table {...$tableAttrs}>
  <thead>
    {#each $headerRows as headerRow (headerRow.id)}
      <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
        <tr {...rowAttrs}>
          {#each headerRow.cells as cell (cell.id)}
            <Subscribe
              attrs={cell.attrs()} let:attrs 
              props={cell.props()} let:props>
              <th {...attrs} on:click={props.sort.toggle}>
                <Render of={cell.render()} />
                {#if props.sort.order === 'asc'}
                  ⬇️
                {:else if props.sort.order === 'desc'}
                  ⬆️
                {/if}
                {#if props.filter?.render}
                  <div>
                      <Render of={props.filter.render} />
                  </div>
                {/if}
              </th>
            </Subscribe>
          {/each}
        </tr>
      </Subscribe>
    {/each}
  </thead>
  <tbody {...$tableBodyAttrs}>
    {#each $pageRows as row (row.id)}
      <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
        <tr {...rowAttrs}>
          {#each row.cells as cell (cell.id)}
            <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
              <td {...attrs}>
                <Render of={cell.render()} />
              </td>
            </Subscribe>
          {/each}
        </tr>
      </Subscribe>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <td colspan=7>
        <div class=links>
          <label for=pageSize>Page size</label>
          <input id=pageSize size=3 type=number min={1} bind:value={$pageSize} />
          <button
            on:click={() => $pageIndex--}
            disabled={!$hasPreviousPage}>
          &laquo;
          </button>
          {$pageIndex + 1} out of {$pageCount}
          <button
            on:click={() => $pageIndex++}
            disabled={!$hasNextPage}>
            &raquo;
          </button>
        </div>
      </td>
    </tr>
  </tfoot>
</table>

<style>
table {
  width: 100%;
  text-align: center;
}
table td, table th {
  padding: 3px 4px;
}
table tbody td {
  font-size: 13px;
  text-align: left;
}
table tr:nth-child(even) {
  background: #D0E4F5;
}
table thead {
  background: #FFFFFF;
  border-bottom: 4px solid #333333;
}
table thead th {
  font-size: 15px;
  font-weight: bold;
  color: #333333;
  text-align: center;
}
table tfoot {
  font-size: 14px;
  font-weight: bold;
  color: #333333;
  border-top: 4px solid #333333;
}
table tfoot td {
  font-size: 14px;
}

table tfoot .links {
  text-align: right;
}

table tfoot .links button {
  display: inline-block;
  background: #1C6EA4;
  color: #FFFFFF;
  padding: 2px 8px;
  border-radius: 5px;
}
</style>
  