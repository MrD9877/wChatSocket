"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app);
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const saveOfflineUserMsg_js_1 = require("./saveOfflineUserMsg.js");
dotenv_1.default.config();
// Modify the return type to match the expected output
function verifyToken(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = (yield jsonwebtoken_1.default.verify(accessToken, process.env.LOCAL_SECRET || ""));
            // Check if the necessary user data exists in the payload
            if (data && data.userId && data.name) {
                return { user: { userId: data.userId, name: data.name } };
            }
            // If the necessary data is missing, return false
            return false;
        }
        catch (err) {
            // Return false if verification fails
            return false;
        }
    });
}
// Set up CORS for Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
io.on("connection", (socket) => {
    socket.on("joinRoom", (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
        const decode = yield verifyToken(accessToken);
        if (!decode || (decode && !decode.user)) {
            io.to(socket.id).emit("welcome", `401`);
        }
        else {
            if (decode.user) {
                io.to(socket.id).emit("welcome", `200`);
                socket.join(decode.user.userId);
                console.log(`User joined room: ${decode.user.name}`);
            }
        }
    }));
    socket.on("private message", (roomId_1, _a) => __awaiter(void 0, [roomId_1, _a], void 0, function* (roomId, { message, accessToken, image, audio }) {
        var _b;
        const decode = yield verifyToken(accessToken);
        if (!decode || (decode && !decode.user)) {
            io.to(socket.id).emit("tokenExpire", `401`);
        }
        else {
            const roomSize = ((_b = io.sockets.adapter.rooms.get(roomId)) === null || _b === void 0 ? void 0 : _b.size) || 0;
            if (roomSize < 1) {
                (0, saveOfflineUserMsg_js_1.saveMsgInDB)(message, roomId, decode.user.userId, image);
            }
            else {
                io.to(roomId).emit("chat message", { message, user: decode.user.userId, audio, image }); // Emit message only to users in the room
            }
        }
    }));
    socket.on("leaveRoom", (roomId) => {
        socket.leave(roomId); // User leaves the room
        console.log(`User left room: ${roomId}`);
    });
    socket.on("call", (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, offer, accessToken, type }) {
        const decode = yield verifyToken(accessToken);
        if (!decode || (decode && !decode.user)) {
            io.to(socket.id).emit("tokenExpired", `401`);
            io.to(socket.id).emit("closeCall", { from: to });
        }
        else {
            io.to(to).emit("requestCall", { offer, from: decode.user.userId, name: decode.user.name, type });
        }
    }));
    socket.on("call:accepted", ({ to, answer, from }) => {
        io.to(to).emit("callRequest:accepted", { answer, from });
    });
    socket.on("peer:negotiation", ({ from, to, offer }) => {
        io.to(to).emit("peer:negotiation", { from, offer });
    });
    socket.on("peer:negotiation:done", ({ from, to, answer }) => {
        io.to(to).emit("peer:negotiation:done", { from, answer });
    });
    socket.on("request:after:course", ({ from, to }) => {
        io.to(to).emit("request:after:course", { from });
    });
    socket.on("request:after:request", ({ from, to }) => {
        io.to(to).emit("request:after:request", { from });
    });
    socket.on("closeCall", ({ from, to }) => {
        io.to(to).emit("closeCall", { from });
    });
    socket.on("requestStream", ({ from, to }) => {
        io.to(to).emit("requestStream", { from });
    });
    socket.on("audio", (record, to) => {
        io.to(to).emit("audio", record);
    });
    socket.on("disconnect", () => {
        const rooms = socket.rooms; // Get all rooms the socket is in
        console.log("user disconnected");
    });
});
server.listen(4000, () => {
    console.log("Server is running on http://localhost:4000");
});
// io.use((socket, next) => {
//   cookieParser()(socket.request, socket.request.res, (err) => {
//     if (err) return next(err);
//     const token = socket.request.cookies.accessToken;
//     // const decode = jwt.verify(token, secret);
//     // console.log(decode);
//   });
//   //   socket.user = "dhuruv";
//   next();
// })
