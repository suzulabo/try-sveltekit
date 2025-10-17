export async function postSendMessage(token: string) {
  const res = await fetch(`/api/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!res.ok) {
    throw new Error('Post sendMessage Error')
  }
}
