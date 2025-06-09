<script lang="ts">
  import { postLog } from '$lib/fetch/postLog';
  import { getNotificationToken } from '$lib/notification/notification';

  let token = $state('');

  const getTokenClick = async () => {
    token = await getNotificationToken();
    await postLog({ token });
  };
  const copyTokenClick = async () => {
    await navigator.clipboard.writeText(token);
  };
</script>

<div class="container">
  <button
    onclick={() => {
      location.reload();
    }}>reload</button
  >
  <div class="get-token-box">
    <button onclick={getTokenClick}>Get token</button>
    <input value={token} readonly />
    <button onclick={copyTokenClick}>Copy token</button>
  </div>
</div>

<style lang="scss">
  .container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .get-token-box {
      input {
        width: 100%;
      }
    }
  }
</style>
