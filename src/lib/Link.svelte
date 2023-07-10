<script lang="ts">
    import { page } from '$app/stores';
    export let href: string;
    export let text: string;
    const url = new URL(href, $page.url);
    if ($page.url.searchParams.has("units"))
       url.searchParams.set('units', $page.url.searchParams.get('units'));
</script>

<a href={url.toString()}>{text}</a>
