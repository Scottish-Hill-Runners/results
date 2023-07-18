<script lang="ts">
  import { page } from '$app/stores';
  import { makeUrl } from './makeUrl';

  export let text: string;
  export let route: string;
  export let params: { [key: string]: string } = {};
</script>

<a href={makeUrl($page.url, route, params)}>{text}</a>
