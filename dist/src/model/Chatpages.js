import mongoose, { Schema } from "mongoose";
const expireAter = 7 * 24 * 60 * 60 * 1000;
const chatsSchema = new Schema({
    chatId: { type: String, required: true },
    userId: { type: String, required: true },
    message: { type: String },
    audio: { type: String },
    image: [{ type: String }],
    video: { type: String },
    timestamp: { type: Number, required: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + expireAter) },
});
chatsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 1 });
export const ChatPage = mongoose.model("ChatPage", chatsSchema);
