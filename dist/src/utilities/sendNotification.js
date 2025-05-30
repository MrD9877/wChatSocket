import webpush from "web-push";
export async function sendNotification(subData, data) {
    const publicKey = process.env.NOTIFICATION_PUBLIC_KEY;
    const privateKey = process.env.NOTIFICATION_PRIVATE_KEY;
    if (!publicKey || !privateKey)
        return;
    webpush.setVapidDetails("mailto:your-email@example.com", publicKey, privateKey);
    const pushSubscription = Object.assign({}, subData);
    const payload = JSON.stringify(data);
    try {
        await webpush.sendNotification(pushSubscription, payload);
    }
    catch (err) {
        console.log(err);
    }
}
