import http from "http";
import jwt from "jsonwebtoken";
import { saveMsgInDB } from "../saveOfflineUserMsg.js";
import { DefaultEventsMap, Server } from "socket.io";

interface UserData {
  userId: string;
  name: string;
}

async function verifyToken(accessToken: string): Promise<{ user: UserData } | false> {
  try {
    const data = jwt.verify(accessToken, process.env.LOCAL_SECRET || "");
    if (data && typeof data !== "string" && data.user) {
      return { user: data.user };
    }

    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function ioInstance(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  io.on("connection", (socket) => {
    socket.on("joinRoom", async (accessToken) => {
      const decode = await verifyToken(accessToken);
      if (!decode || (decode && !decode.user)) {
        io.to(socket.id).emit("welcome", `401`);
      } else {
        if (decode.user) {
          io.to(socket.id).emit("welcome", `200`);
          socket.join(decode.user.userId);
          console.log(`User joined room: ${decode.user.name}`);
        }
      }
    });

    socket.on("private message", async (roomId: string, { message, accessToken, image, audio, id }: { message: string; accessToken: string; image?: string | string[]; audio: string; id: string }) => {
      console.log({ message });
      const decode = await verifyToken(accessToken);
      if (!decode || (decode && !decode.user)) {
        io.to(socket.id).emit("tokenExpire", `401`);
      } else {
        const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        console.log({ roomSize, roomId, image });
        io.to(roomId).emit("chat message", { message, user: decode.user.userId, audio, image, id, username: decode.user.name });
        saveMsgInDB({ message, to: roomId, userId: decode.user.userId, image, audio, id });
      }
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId); // User leaves the room
      console.log(`User left room: ${roomId}`);
    });

    socket.on("call", async ({ to, offer, accessToken, type }) => {
      const decode = await verifyToken(accessToken);
      if (!decode || (decode && !decode.user)) {
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
      console.log("user disconnected");
    });
  });
}
