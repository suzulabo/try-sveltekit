import { env } from '$env/dynamic/private';
import { FCM, FcmOptions } from 'fcm-cloudflare-workers';
import type { RequestHandler } from './$types';

const fcmOptions = new FcmOptions({
  serviceAccount: JSON.parse(Buffer.from(env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')),
});
const fcm = new FCM(fcmOptions);

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  const token = data.token;

  await fcm.sendToTokens(
    {
      webpush: {
        fcm_options: {
          link: `/pages/${new Date().getTime()}`,
        },
        notification: {
          title: 'Test',
          body: 'Test',
        },
      },
    },
    [token],
  );

  return Response.json({});
};
