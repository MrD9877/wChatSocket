import mongoose, { Schema, Document } from "mongoose";

// Define the interface for chat message
interface IChats {
  user: string;
  date: Date;
  message: string;
  isImage: boolean;
}

// Define the interface for the chat page
interface IChatPage extends Document {
  chatId: string;
  chats: Array<{
    date: Date;
    chat: IChats[];
  }>;
  imagesUrl: Array<{
    imageId: string;
    url: string;
    dateGenerated: Date;
  }>;
}

// Define the schema for the chat page
const chatsSchema = new Schema<IChatPage>({
  chatId: {
    type: Schema.Types.String,
    required: true,
  },
  chats: [
    {
      date: { type: Schema.Types.Date, required: true },
      chat: [
        {
          user: {
            type: Schema.Types.String,
            required: true,
          },
          date: {
            type: Schema.Types.Date,
            required: true,
          },
          message: {
            type: Schema.Types.String,
            required: true,
          },
          isImage: {
            type: Schema.Types.Boolean,
            default: false,
          },
        },
      ],
    },
  ],
  imagesUrl: [
    {
      imageId: { type: Schema.Types.String },
      url: { type: Schema.Types.String },
      dateGenerated: { type: Schema.Types.Date },
    },
  ],
});

// Create and export the model
export const ChatPage = mongoose.model<IChatPage>("ChatPage", chatsSchema);
