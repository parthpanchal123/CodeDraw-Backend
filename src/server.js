import express from "express";
import idRouter from "./router/idRouter.js";
import helmet from "helmet";
// import morgan from "morgan";
import http from "http";
import cors from "cors";
import * as io from "socket.io";
import fetch from "node-fetch";
import { ExpressPeerServer } from "peer";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import connectDb from "./db/config.js";

const app = express();
const server = http.Server(app);
var privateKey = process.env.DOMAIN_KEY;
var certificate = process.env.DOMAIN_CERT;

const peerServer = ExpressPeerServer(server, {
  debug: true,
  port: 443,
  proxied: true,
  ssl: {
    key: privateKey,
    cert: certificate,
  },
  generateClientId: () => nanoid(),
});

const io_server = new io.Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;

// app.use(morgan("tiny"));
app.use(
  cors({
    credentials: false,
  })
);
app.use(helmet());
app.use(express.json());
app.use("/peerJs", peerServer);

// Connect to the Database
try {
  connectDb();
} catch (error) {
  throw new Error(error.message);
}

app.use("/id", idRouter);
app.get("/:roomId", (req, res) => {
  res.redirect(`/${roomId}`);
});

app.post("/exec", async (req, res) => {
  const data = req.body;
  console.log("this is", JSON.stringify(data));

  fetch("https://onecompiler.com/api/code/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((r) => r.json())
    .then((data) => {
      console.log(data);
      return res.json({
        exception: data.exception,
        stdout: data.stdout,
        stderr: data.stderr,
        executionTime: data.executionTime,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
});

io_server.on("connection", (socket) => {
  if (!socket) throw new Error("Socket connection failed");
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    // socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.broadcast.to(roomId).emit("user-connected", userId);

    socket.on("drawing-data", (data) => {
      // console.log(data);
      socket.broadcast.to(roomId).emit("receive-drawing-data", data);
    });

    socket.on("editor-changes", (data) => {
      socket.broadcast.to(roomId).emit("receive-editor-data", data);
    });

    socket.on("video-off", (uId) => {
      socket.broadcast.to(roomId).emit("video-off", uId);
    });

    socket.on("video-on", (uId) => {
      socket.broadcast.to(roomId).emit("video-on", uId);
    });

    socket.on("audio-off", (uId) => {
      socket.broadcast.to(roomId).emit("audio-off", uId);
    });

    socket.on("audio-on", (uId) => {
      socket.broadcast.to(roomId).emit("audio-on", uId);
    });

    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT} 🚀 `);
});
