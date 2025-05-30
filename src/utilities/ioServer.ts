// const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
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
    socket.on("joinRoom", async ({ accessToken }) => {
      const decode = await verifyToken(accessToken);
      if (!decode || !decode.user) {
        socket.emit("unauthorized", { data: { accessToken }, custom: "joinRoom" });
        return;
      }
      socket.join(decode.user.userId);
    });

    socket.on("private message", async ({ roomId, message, accessToken, image, audio, id }: { message: string; accessToken: string; image?: string | string[]; audio: string; id: string; roomId: string }) => {
      const decode = await verifyToken(accessToken);
      if (!decode || (decode && !decode.user)) {
        socket.emit("unauthorized", { data: { roomId, message, accessToken, image, audio, id }, custom: "private message" });
      } else {
        io.to(roomId).emit("chat message", { message, user: decode.user.userId, audio, image, id, username: decode.user.name });
        saveMsgInDB({ message, to: roomId, userId: decode.user.userId, image, audio, id });
      }
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId); // User leaves the room
      console.log(`User left room: ${roomId}`);
    });

    socket.on("call", async ({ to, accessToken, type }) => {
      const decode = await verifyToken(accessToken);
      if (!decode || (decode && !decode.user)) {
        socket.emit("unauthorized", { data: { to, accessToken, type }, custom: "call" });
      } else {
        io.to(to).emit("requestCall", { from: decode.user.userId, name: decode.user.name, type });
      }
    });

    socket.on("offer", async ({ to, offer, accessToken }) => {
      const decode = await verifyToken(accessToken);
      if (!decode || (decode && !decode.user)) {
        socket.emit("unauthorized", { data: { to, offer, accessToken }, custom: "offer" });
      } else if (decode.user) {
        io.to(to).emit("offer", { offer, from: decode.user.userId });
      }
    });

    socket.on("answer", async ({ accessToken, to, answer }) => {
      const decode = await verifyToken(accessToken);
      if (!decode || (decode && !decode.user)) {
        socket.emit("unauthorized", { data: { accessToken, to, answer }, custom: "answer" });
      } else if (decode.user) {
        io.to(to).emit("answer", { from: decode.user.userId, answer });
      }
    });

    socket.on("closeCall", ({ from, to }) => {
      io.to(to).emit("closeCall", { from });
    });

    socket.on("disconnect", () => {
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      rooms.forEach((room) => {
        socket.leave(room);
      });
    });
  });
}
