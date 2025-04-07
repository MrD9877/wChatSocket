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
exports.saveMsgInDB = saveMsgInDB;
const mongoose_1 = __importDefault(require("mongoose"));
const User_js_1 = require("./model/User.js");
const dotenv_1 = __importDefault(require("dotenv"));
const getTime_js_1 = require("./utilities/getTime.js");
const random_js_1 = require("./utilities/random.js");
const Chatpages_js_1 = require("./model/Chatpages.js");
const sendNotification_js_1 = require("./utilities/sendNotification.js");
dotenv_1.default.config();
function saveMsgInDB(msg, to, user, image) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.MONGO_DB_STRING)
            throw Error("no MONGO_DB_STRING");
        try {
            yield mongoose_1.default.connect(process.env.MONGO_DB_STRING);
            const userInfo = yield User_js_1.User.findOne({ userId: to });
            if (!userInfo)
                return { msg: "EROOR NO USER WITH GIVEN ID FOUND", status: 400 };
            const sub = yield User_js_1.User.findOne({ userId: to }, { subscribe: 1 });
            if (sub && sub.subscribe && userInfo && userInfo.name) {
                yield (0, sendNotification_js_1.sendNotification)(sub.subscribe, { title: userInfo.name, body: msg });
            }
            const chat = userInfo.chatPages.get(user);
            const newId = (0, random_js_1.generateRandom)(32);
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
                yield userInfo.save();
                const newChat = new Chatpages_js_1.ChatPage({
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
                yield newChat.save();
                return;
            }
            else if (typeof chat.newMessages === "number") {
                userInfo.chatPages.set(user, {
                    chatId: chat.chatId,
                    lastMessage: {
                        date: new Date(),
                        message: msg,
                    },
                    newMessages: chat.newMessages + 1,
                    date: new Date(),
                });
                yield userInfo.save();
                const newChat = yield Chatpages_js_1.ChatPage.findOne({ chatId: chat.chatId });
                if (!newChat)
                    return;
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
                    const res = yield newChat.save();
                    return;
                }
                const chats = newChat.chats[newChat.chats.length - 1];
                if (chats && (0, getTime_js_1.getDate)(chats.date) === (0, getTime_js_1.getDate)(new Date())) {
                    newChat.chats[newChat.chats.length - 1].chat.push({
                        user: user,
                        date: new Date(),
                        message: msg,
                        isImage: false,
                    });
                    yield newChat.save();
                    return;
                }
                else if (chats) {
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
                    yield newChat.save();
                    return;
                }
            }
        }
        catch (err) {
            console.log(err);
            return { msg: "INTERNAL SERVER ERROR", status: 500 };
        }
    });
}
