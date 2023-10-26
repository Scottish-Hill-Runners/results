<script lang="ts">
  import { Button, ButtonGroup, Heading, P } from 'flowbite-svelte';
</script>

<Heading>Scottish Hill Runners Results</Heading>

<P>
    Welcome to Scottish Hill Runners,
    an independent organisation helping to support and promote hill running in Scotland.
</P>

<P>
    This is the experimental new results site.
    You'll find the main site at <a href="https://www.scottishhillrunners.uk/Home.aspx">www.scottishhillrunners.uk</a>.
</P>

<ButtonGroup>
  <Button href="races">Races (metric)</Button>
  <Button href="races?units=imperial">Races (imperial)</Button>
  <Button href="races?category=F">Boireannaich</Button>
  <Button href="races?category=M">Fireannaich</Button>
</ButtonGroup>

<P xmlns:cc="http://creativecommons.org/ns#"
   xmlns:dct="http://purl.org/dc/terms/">
    <span property="dct:title">SHR Results</span> by
    <span property="cc:attributionName">John Hamer</span> is licensed under
    <a href="http://creativecommons.org/licenses/by-sa/4.0/?ref=chooser-v1"
       target="_blank"
       rel="license noopener noreferrer"
       style="display:inline-block;">CC BY-SA 4.0
       <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;"
            src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"
            alt="" />
       <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;"
            src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"
            alt="" />
       <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;"
            src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1"
            alt="" />
    </a>
</P>
