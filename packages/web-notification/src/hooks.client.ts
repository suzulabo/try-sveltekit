import { listenOnMessage } from '$lib/notification/notification';

listenOnMessage();

if ('serviceWorker' in navigator) {
  const { active } = await navigator.serviceWorker.ready;
  if (active) {
    active.postMessage('ready');
  }
}
