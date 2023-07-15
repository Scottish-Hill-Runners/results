<script lang="ts">
  import { Render, Subscribe } from 'svelte-headless-table';
  import type { TableViewModel } from 'svelte-headless-table';

  type Item = $$Generic;
  export let tableViewModel: TableViewModel<Item>;
  const {
      headerRows,
      pageRows,
      tableAttrs,
      tableBodyAttrs,
      pluginStates
    } = tableViewModel;
  const { pageIndex, pageCount, pageSize, hasNextPage, hasPreviousPage } = pluginStates.page;
  $pageSize = 20;
</script>

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
            <button
              on:click={() => $pageIndex = 0}>
              1
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
    width: auto;
    text-align: center;
    table-layout: auto;
  }
  table td, table th {
    padding: 3px 4px;
    width: auto;
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
    vertical-align: top;
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
    