"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandom = generateRandom;
const crypto_1 = __importDefault(require("crypto"));
function generateRandom(bytes) {
    const n = crypto_1.default.randomBytes(bytes).toString("hex");
    return n;
}
