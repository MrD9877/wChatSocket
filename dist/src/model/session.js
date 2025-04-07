"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const sessionSchema = new Schema({
    sessionData: {
        type: Schema.Types.Mixed,
    },
    expiresAt: { type: Date, required: true },
});
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 1 });
exports.Session = mongoose_1.default.model("Session", sessionSchema);
