import webpush from "web-push";
import { typeNotificationData } from "../saveOfflineUserMsg.js";
export async function sendNotification(subData: webpush.PushSubscription, data: typeNotificationData) {
  const publicKey = process.env.NOTIFICATION_PUBLIC_KEY;
  const privateKey = process.env.NOTIFICATION_PRIVATE_KEY;
  if (!publicKey || !privateKey) return;
  webpush.setVapidDetails("mailto:your-email@example.com", publicKey, privateKey);

  const pushSubscription = { ...subData };
  const payload = JSON.stringify(data);
  try {
    await webpush.sendNotification(pushSubscription, payload);
  } catch (err) {
    console.log(err);
  }
}
