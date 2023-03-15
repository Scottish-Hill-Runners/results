<script lang="ts">
    export let data: FrontMatter[];
</script>

<h1>Hill races in Scotland</h1>

<table>
    <tr>
        <th>Name</th>
        <th>Venue</th>
        <th>Distance</th>
        <th>Ascent</th>
    </tr>
{#each data as d}
    <tr>
        <td><a href={d.raceId}>{d.title}</a></td>
        <td>{d.venue}</td>
        <td>{d.distance}</td>
        <td>{d.climb}</td>
    </tr>
{/each}
</table>
