"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define the schema for the user
const userSchema = new mongoose_1.Schema({
    email: {
        type: mongoose_1.Schema.Types.String,
        required: true,
        unique: true,
    },
    userId: { type: mongoose_1.Schema.Types.String },
    name: {
        type: mongoose_1.Schema.Types.String,
    },
    profilePic: {
        type: mongoose_1.Schema.Types.String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    friends: [
        {
            name: { type: mongoose_1.Schema.Types.String },
            email: { type: mongoose_1.Schema.Types.String },
            userId: { type: mongoose_1.Schema.Types.String },
        },
    ],
    subscribe: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    friendRequests: [{ type: mongoose_1.Schema.Types.Mixed }],
    friendRequestSend: [{ type: mongoose_1.Schema.Types.String }],
    chatPages: {
        type: Map,
        of: new mongoose_1.Schema({
            chatId: {
                type: mongoose_1.Schema.Types.String,
                required: true,
            },
            lastMessage: {
                date: { type: mongoose_1.Schema.Types.Date },
                message: { type: mongoose_1.Schema.Types.String },
            },
            newMessages: {
                type: mongoose_1.Schema.Types.Number,
                default: 0,
            },
            date: {
                type: mongoose_1.Schema.Types.Date,
            },
        }),
        default: {},
    },
});
// Define a text index on email and name
userSchema.index({ email: "text", name: "text" });
// Create and export the model
exports.User = mongoose_1.default.model("User", userSchema);
