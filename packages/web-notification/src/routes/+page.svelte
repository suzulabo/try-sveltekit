<script lang='ts'>
  import { postLog } from '$lib/fetch/postLog'
  import { postSendMessage } from '$lib/fetch/postSendMessage'
  import { getNotificationToken } from '$lib/notification/notification'

  let token = $state('')
  let sendToken = $state('')

  const getTokenClick = async () => {
    token = await getNotificationToken()
    await postLog({ token })
  }
  const copyTokenClick = async () => {
    await navigator.clipboard.writeText(token)
  }
  const sendTokenClick = async () => {
    if (!sendToken) {
      return
    }
    await postSendMessage(sendToken)
  }
</script>

<div class='container'>
  <button
    onclick={() => {
      location.reload()
    }}>reload</button
  >
  <div class='get-token-box'>
    <button onclick={getTokenClick}>Get token</button>
    <input value={token} readonly />
    <button onclick={copyTokenClick}>Copy token</button>
  </div>

  <div class='send-token-box'>
    <input bind:value={sendToken} />
    <button onclick={sendTokenClick}>Send</button>
  </div>
</div>

<style lang='scss'>
  .container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    input {
      width: 100%;
    }
  }
</style>
