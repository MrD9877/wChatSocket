import mongoose from "mongoose";
import { User } from "./model/User.js";
import dotenv from "dotenv";
import { ChatPage } from "./model/Chatpages.js";
import { sendNotification } from "./utilities/sendNotification.js";
dotenv.config();

export type typeNotificationData = {
  name: string;
  message: string;
  image: string | string[] | undefined;
  audio: string | undefined;
  userId: string;
  id: string;
  clientId: string;
  timestamp: number;
};

export async function saveMsgInDB({ message, to, userId, image, audio, id }: { message: string; to: string; userId: string; image?: string | string[]; audio?: string; id: string }) {
  if (!process.env.MONGO_DB_STRING) throw Error("no MONGO_DB_STRING");
  try {
    await mongoose.connect(process.env.MONGO_DB_STRING);
    const userInfo = await User.findOne({ userId: to });
    const from = await User.findOne({ userId }, { name: 1 });
    if (!userInfo || !from) return { msg: "EROOR NO USER WITH GIVEN ID FOUND", status: 400 };
    if (userInfo.name) {
      const data = { name: from.name, message, image, audio, userId, id, clientId: to, timestamp: Date.now() };
      if (userInfo.subscribe) await sendNotification(userInfo.subscribe, data);
    }
    userInfo.chats.push(id);
    userInfo.save();
    const date = Date.now();
    const chat = new ChatPage({ chatId: id, message, userId, timestamp: date, image, audio });
    await chat.save();
  } catch (err) {
    console.log(err);
    return { msg: "INTERNAL SERVER ERROR", status: 500 };
  }
}
