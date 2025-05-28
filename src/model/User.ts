import mongoose, { Schema, Document } from "mongoose";

export type FriendRequest = {
  name: string;
  email: string;
  userId: string;
  profilePic: string;
};

export type Usertype = {
  email: string;
  userId: string;
  name: string;
  profilePic: string;
  friends: Array<{
    userId: string;
  }>;
  subscribe: any;
  friendRequests: FriendRequest[];
  friendRequestSend: string[];
  chats: string[];
};
export interface IUser extends Usertype, Document {}
const userSchema = new Schema<Usertype & Document>({
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
  friends: [
    {
      userId: { type: Schema.Types.String },
    },
  ],
  subscribe: {
    type: Schema.Types.Mixed,
  },
  friendRequests: [
    {
      name: { type: Schema.Types.String },
      email: { type: Schema.Types.String },
      userId: { type: Schema.Types.String },
      profilePic: { type: Schema.Types.String },
    },
  ],
  friendRequestSend: [{ type: Schema.Types.String }],
  chats: [{ type: String }],
});

// Define a text index on email and name
userSchema.index({ email: "text", name: "text" });

// Create and export the model
export const User = mongoose.model<Usertype & Document>("User", userSchema);
