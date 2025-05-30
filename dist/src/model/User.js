import mongoose, { Schema } from "mongoose";
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
export const User = mongoose.model("User", userSchema);
