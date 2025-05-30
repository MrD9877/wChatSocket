import crypto from "crypto";
export function generateRandom(bytes) {
    const n = crypto.randomBytes(bytes).toString("hex");
    return n;
}
