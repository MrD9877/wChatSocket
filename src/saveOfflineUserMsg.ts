import mongoose from "mongoose";
import { User } from "./model/User.js";
import dotenv from "dotenv";
import { getDate } from "./utilities/getTime.js";
import { generateRandom } from "./utilities/random.js";
import { ChatPage } from "./model/Chatpages.js";
import { sendNotification } from "./utilities/sendNotification.js";
dotenv.config();

export async function saveMsgInDB(msg: string, to: string, user: string, image: string) {
  if (!process.env.MONGO_DB_STRING) throw Error("no MONGO_DB_STRING");
  try {
    await mongoose.connect(process.env.MONGO_DB_STRING);
    const userInfo = await User.findOne({ userId: to });
    if (!userInfo) return { msg: "EROOR NO USER WITH GIVEN ID FOUND", status: 400 };
    const sub = await User.findOne({ userId: to }, { subscribe: 1 });
    if (sub && sub.subscribe && userInfo && userInfo.name) {
      await sendNotification(sub.subscribe, { title: userInfo.name, body: msg });
    }
    const chat = userInfo.chatPages.get(user);
    const newId = generateRandom(32);
    if (!chat) {
      userInfo.chatPages.set(user, {
        chatId: newId,
        lastMessage: {
          date: new Date(),
          message: msg,
        },
        newMessages: 1,
        date: new Date(),
      });
      await userInfo.save();
      const newChat = new ChatPage({
        chatId: newId,
        chats: [
          {
            date: new Date(),
            chat: {
              user: user,
              date: new Date(),
              message: msg,
            },
          },
        ],
      });
      await newChat.save();
      return;
    } else if (typeof chat.newMessages === "number") {
      userInfo.chatPages.set(user, {
        chatId: chat.chatId,
        lastMessage: {
          date: new Date(),
          message: msg,
        },
        newMessages: chat.newMessages + 1,
        date: new Date(),
      });
      await userInfo.save();
      const newChat = await ChatPage.findOne({ chatId: chat.chatId });
      if (!newChat) return;
      if (!newChat.chats || newChat.chats.length < 1) {
        newChat.chats = [
          {
            date: new Date(),
            chat: [
              {
                user: user,
                date: new Date(),
                message: msg,
                isImage: false,
              },
            ],
          },
        ];
        const res = await newChat.save();
        return;
      }

      const chats = newChat.chats[newChat.chats.length - 1];
      if (chats && getDate(chats.date) === getDate(new Date())) {
        newChat.chats[newChat.chats.length - 1].chat.push({
          user: user,
          date: new Date(),
          message: msg,
          isImage: false,
        });
        await newChat.save();
        return;
      } else if (chats) {
        newChat.chats.push({
          date: new Date(),
          chat: [
            {
              date: new Date(),
              message: msg,
              user: user,
              isImage: false,
            },
          ],
        });
        await newChat.save();
        return;
      }
    }
  } catch (err) {
    console.log(err);
    return { msg: "INTERNAL SERVER ERROR", status: 500 };
  }
}
