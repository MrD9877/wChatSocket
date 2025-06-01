import mongoose from "mongoose";
import { User } from "./model/User.js";
import dotenv from "dotenv";
import { ChatPage } from "./model/Chatpages.js";
import { sendNotification } from "./utilities/sendNotification.js";
dotenv.config();

export type typeNotificationData = {
  name: string;
  message?: string;
  image: string | string[] | undefined;
  audio: string | undefined;
  userId: string;
  id: string;
  clientId: string;
  timestamp: number;
};

type SaveMsgInDB = {
  message?: string | undefined;
  to: string;
  userId: string;
  image?: string | string[];
  audio?: string;
  id: string;
  roomSize: number;
  timestamp: number;
  name: string;
};

export async function saveMsgInDB({ message, to, userId, image, audio, id, roomSize, timestamp, name }: SaveMsgInDB) {
  if (!process.env.MONGO_DB_STRING) throw Error("no MONGO_DB_STRING");
  try {
    await mongoose.connect(process.env.MONGO_DB_STRING);
    const data = { name, message, image, audio, userId, id, clientId: to, timestamp };
    const userInfo = await User.findOne({ userId: to });
    if (!userInfo) throw Error();
    if (roomSize === 0) {
      const from = await User.findOne({ userId }, { name: 1 });
      if (!from) throw Error();
      userInfo.chats.push(id);
      userInfo.save();
      const chat = new ChatPage({ chatId: id, message, userId, timestamp, image, audio });
      await chat.save();
    }
    if (userInfo.subscribe) await sendNotification(userInfo.subscribe, data);
  } catch (err) {
    console.log(err);
    return { msg: "INTERNAL SERVER ERROR", status: 500 };
  }
}
