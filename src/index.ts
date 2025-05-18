import express from "express";
import http from "http";
import dotenv from "dotenv";
import { ioInstance } from "./utilities/ioServer.js";
import { Server } from "socket.io";

type BasicReq = {
  userId: string;
  message: string;
};

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/notification", async (req, res) => {
  const body: BasicReq = req.body;
  if (!body || !body.message || !body.userId) {
    res.sendStatus(400);
  }
  const { userId, message } = body;
  try {
    io.to(userId).emit(message);
    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

ioInstance(io);

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
