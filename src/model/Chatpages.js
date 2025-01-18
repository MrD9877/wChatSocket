import mongoose from "mongoose";
const { Schema } = mongoose;

const chatsSchema = new Schema({
  chatId: {
    type: Schema.Types.String,
    required: true,
  },
  chats: [
    {
      date: { type: Schema.Types.Date },
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

export const ChatPage = mongoose.models.ChatPage || mongoose.model("ChatPage", chatsSchema);
