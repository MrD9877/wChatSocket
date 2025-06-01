import express, { Request, Response } from "express";
import http from "http";
import dotenv from "dotenv";
import { ioInstance } from "./utilities/ioServer.js";
import { Server } from "socket.io";
import { sendNotification } from "./utilities/sendNotification.js";

type BasicReq = {
  userId: string;
  message: string;
};

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

app.post("/notification", (req: Request<{}, {}, BasicReq>, res: Response) => {
  const body: BasicReq = req.body;
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
  } catch {
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

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log("Server is running on http://localhost:4000");
});
