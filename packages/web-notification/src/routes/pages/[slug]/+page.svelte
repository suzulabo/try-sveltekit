<script lang='ts'>
  import type { PageProps } from './$types'

  const { data }: PageProps = $props()
</script>

<div class='container'>
  {data.slug}
</div>

<style lang='scss'>
  .container {
    margin: 20svh auto;
    width: min-content;
    font-size: 32px;
  }
</style>
