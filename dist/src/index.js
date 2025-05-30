import express from "express";
import http from "http";
import dotenv from "dotenv";
import { ioInstance } from "./utilities/ioServer.js";
import { Server } from "socket.io";
import { sendNotification } from "./utilities/sendNotification.js";
dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(express.json());
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
ioInstance(io);
app.get("/", (req, res) => {
    res.send("hi");
});
app.post("/notification", (req, res) => {
    const body = req.body;
    if (!body || !body.message || !body.userId) {
        res.sendStatus(400);
        return;
    }
    if (!req.headers.authorization || req.headers.authorization !== `Bearer ${process.env.LOCAL_SECRET}`) {
        res.sendStatus(401);
        return;
    }
    const { userId } = body;
    try {
        io.to(userId).emit("inAppNotification", body);
        res.sendStatus(200);
        return;
    }
    catch (_a) {
        res.sendStatus(500);
        return;
    }
});
app.post("/pushNotification", async (req, res) => {
    const { sub, data } = req.body;
    await sendNotification(sub, data);
    res.sendStatus(200);
    return;
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
