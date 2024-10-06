<script lang="ts">
  import { A, Button, ButtonGroup, Heading, P } from 'flowbite-svelte';
</script>

<Heading>Scottish Hill Runners Results</Heading>

<P>
  Welcome to Scottish Hill Runners, an independent organisation helping to support and promote hill running in Scotland.
</P>

<P>
  This is the experimental new results site.
  You'll find the main site at <A href="https://www.scottishhillrunners.uk/Home.aspx">www.scottishhillrunners.uk</A>.
</P>

<ButtonGroup>
  <Button href="races">Races (metric)</Button>
  <Button href="races?units=imperial">Races (imperial)</Button>
  <Button href="races?category=F">Boireannaich</Button>
  <Button href="races?category=M">Fireannaich</Button>
</ButtonGroup>

<P>
  You can also view results <A href="year">by year</A>.
</P>