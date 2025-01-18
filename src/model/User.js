import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: Schema.Types.String,
    required: true,
    unique: true,
  },
  userId: { type: Schema.Types.String },
  name: {
    type: Schema.Types.String,
  },
  profilePic: {
    type: Schema.Types.String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  friends: [
    {
      name: { type: Schema.Types.String },
      email: { type: Schema.Types.String },
      userId: { type: Schema.Types.String },
    },
  ],
  friendRequests: [{ type: Schema.Types.Mixed }],
  friendRequestSend: [{ type: Schema.Types.String }],
  chatPages: {
    type: Map,
    of: new Schema({
      chatId: {
        type: Schema.Types.String,
        required: true,
      },
      lastMessage: {
        date: { type: Schema.Types.Date },
        message: { type: Schema.Types.String },
      },
      newMessages: {
        type: Schema.Types.Number,
        default: 0,
      },
      date: {
        type: Schema.Types.Date,
      },
    }),
    default: {},
  },
});
userSchema.index({ email: "text", name: "text" });
export const User = mongoose.models.User || mongoose.model("User", userSchema);
