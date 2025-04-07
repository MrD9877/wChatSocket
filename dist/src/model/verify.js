"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verify = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const veriftSchema = new Schema({
    user: {
        type: Schema.Types.String,
        required: true,
    },
    otp: {
        type: Schema.Types.Number,
        required: true,
    },
    expiresAt: { type: Date, required: true },
});
veriftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 1 });
exports.Verify = mongoose_1.default.model("Verify", veriftSchema);
