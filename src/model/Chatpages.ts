import mongoose, { Schema, Document, Model } from "mongoose";

export type SavedDbMessages = {
  id: string;
  userId: string;
  message?: string;
  audio?: Blob[] | undefined;
  image?: string[] | string | undefined;
  video?: string | undefined;
  timestamp: number;
  sender: boolean;
};

export type Chats = Omit<SavedDbMessages, "id" | "sender">;

const expireAter = 7 * 24 * 60 * 60 * 1000;

interface IChats extends Chats, Document {
  chatId: string;
  expiresAt: Date;
}

const chatsSchema = new Schema<IChats>({
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
export const ChatPage = mongoose.model<IChats>("ChatPage", chatsSchema);
