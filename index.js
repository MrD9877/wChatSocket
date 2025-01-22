import express from "express";
const app = express();
import http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { keys } from "./src/utilities/keys.js";
import { saveMsgInDB } from "./src/saveOfflineUserMsg.js";
dotenv.config();

const secret = "secret";

// Set up CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // The client-side URL where the React app is hosted
    methods: ["GET", "POST"], // Allowed methods for CORS
    credentials: true,
  },
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
// });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (accessToken) => {
    const decode = jwt.verify(accessToken, process.env.LOCAL_SECRET, (err, data) => {
      if (err) return keys.ERROR;
      return data;
    });
    if (decode === keys.ERROR) {
      io.to(socket.id).emit("welcome", `401`);
    } else {
      if (decode.user) {
        io.to(socket.id).emit("welcome", `200`);
        socket.join(decode.user.userId);
        console.log(`User joined room: ${decode.user.name}`);
      }
    }
  });

  socket.on("private message", (roomId, { message, accessToken, image, audio }) => {
    const decode = jwt.verify(accessToken, process.env.LOCAL_SECRET, (err, data) => {
      if (err) return keys.ERROR;
      return data;
    });
    if (decode === keys.ERROR) {
      io.to(socket.id).emit("tokenExpire", `401`);
    } else {
      const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      if (roomSize < 1) {
        saveMsgInDB(message, roomId, decode.user.userId, image);
      } else {
        io.to(roomId).emit("chat message", { message, user: decode.user.userId, audio, image }); // Emit message only to users in the room
      }
    }
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId); // User leaves the room
    console.log(`User left room: ${roomId}`);
  });

  socket.on("call", ({ to, offer, accessToken, type }) => {
    const decode = jwt.verify(accessToken, process.env.LOCAL_SECRET, (err, data) => {
      if (err) return keys.ERROR;
      return data;
    });
    if (decode === keys.ERROR) {
      io.to(socket.id).emit("tokenExpired", `401`);
      io.to(socket.id).emit("closeCall", { from: to });
    } else {
      io.to(to).emit("requestCall", { offer, from: decode.user.userId, name: decode.user.name, type });
    }
  });

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
