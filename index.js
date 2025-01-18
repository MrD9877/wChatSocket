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
  console.log("a user connected ", socket.id);

  socket.on("joinRoom", (accessToken) => {
    // console.log("accessToken", accessToken);
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

  socket.on("private message", (roomId, { message, accessToken, image }) => {
    const decode = jwt.verify(accessToken, process.env.LOCAL_SECRET, (err, data) => {
      if (err) return keys.ERROR;
      return data;
    });
    if (decode === keys.ERROR) {
      io.to(socket.id).emit("tokenExpire", `401`);
    } else {
      console.log(`Message to room ${roomId}: ${message} by ${decode.user.userId}`);
      const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      if (roomSize < 1) {
        saveMsgInDB(message, roomId, decode.user.userId, image);
      } else {
        if (image) {
          io.to(roomId).emit("chat message", { message, user: decode.user.userId, image });
        } else {
          io.to(roomId).emit("chat message", { message, user: decode.user.userId }); // Emit message only to users in the room
        }
      }
    }
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId); // User leaves the room
    console.log(`User left room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    const rooms = socket.rooms; // Get all rooms the socket is in
    console.log(rooms);
    // rooms.forEach((room) => {
    //   console.log(room);
    //   if (room !== socket.id) {
    //     // Ignore the default room (socket.id)
    //     socket.leave(room); // Leave the room
    //     console.log(`User left room: ${room}`);
    //   }
    // });
    console.log("user disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
