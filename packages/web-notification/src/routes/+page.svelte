<script lang="ts">
  import { getNotificationToken } from '$lib/notification/notification';

  let token = $state('');

  const getTokenClick = async () => {
    token = await getNotificationToken();
  };
  const copyTokenClick = async () => {
    await navigator.clipboard.writeText(token);
  };
</script>

<div class="container">
  <div class="get-token-box">
    <button onclick={getTokenClick}>Get token</button>
    <input value={token} readonly />
    <button onclick={copyTokenClick}>Copy token</button>
  </div>
</div>

<style lang="scss">
  .container {
    padding: 20px;

    .get-token-box {
      input {
        width: 100%;
      }
    }
  }
</style>
