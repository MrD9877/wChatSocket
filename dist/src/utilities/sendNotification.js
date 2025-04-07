"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = sendNotification;
const web_push_1 = __importDefault(require("web-push"));
function sendNotification(subData, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const publicKey = "BO3Jr3L3pKHVPp7SnEpmelRfoI-9T7o1FtIMleCDemAku_U83dTK--h_3JRPoXxFoHaUUr8h-noipUpNtgMVe4g";
        const privateKey = "hRunz5ZgYXRKMrIVRBLWks7jaXZDKYolKhDjxX0tugg";
        // Set VAPID details
        web_push_1.default.setVapidDetails("mailto:your-email@example.com", publicKey, privateKey);
        // Push subscription object (this would be from your database)
        const pushSubscription = Object.assign({}, subData);
        // Push notification payload
        const payload = JSON.stringify({
            title: data.title,
            body: data.body,
            icon: "path-to-icon.png",
        });
        // Send push notification
        const promise = new Promise((resolve, reject) => {
            web_push_1.default
                .sendNotification(pushSubscription, payload)
                .then((response) => {
                resolve(200);
            })
                .catch((error) => {
                resolve(500);
                console.error("Error sending push notification:", error);
            });
        });
        yield promise;
    });
}
