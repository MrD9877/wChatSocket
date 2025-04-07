import webPush from "web-push";
export async function sendNotification(subData: webPush.PushSubscription, data: { title: string; body: string }) {
  const publicKey = "BO3Jr3L3pKHVPp7SnEpmelRfoI-9T7o1FtIMleCDemAku_U83dTK--h_3JRPoXxFoHaUUr8h-noipUpNtgMVe4g";
  const privateKey = "hRunz5ZgYXRKMrIVRBLWks7jaXZDKYolKhDjxX0tugg";

  // Set VAPID details
  webPush.setVapidDetails("mailto:your-email@example.com", publicKey, privateKey);

  // Push subscription object (this would be from your database)
  const pushSubscription = { ...subData };

  // Push notification payload
  const payload = JSON.stringify({
    title: data.title,
    body: data.body,
    icon: "path-to-icon.png",
  });

  // Send push notification
  const promise = new Promise((resolve, reject) => {
    webPush
      .sendNotification(pushSubscription, payload)
      .then((response) => {
        resolve(200);
      })
      .catch((error) => {
        resolve(500);
        console.error("Error sending push notification:", error);
      });
  });
  await promise;
}
