import express from "express";
import { Server } from "socket.io";
import http from 'http';
import { Browser } from "./Browser.js";
import { Operation } from "./Operation.js";
import { SocketHandler } from "./SocketHandler.js";

const PORT = 8080;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
   cors: {
      origin: "http://localhost:5173"
   }
});

app.get('/', (req, res) => {
   res.json({ status: 200 });
});


io.on('connection', async (_socket) => {
   const socketHandler = new SocketHandler(_socket);

   Operation.emit = socketHandler.emitEvent;

   _socket.on('chat_message', socketHandler.onChatMessage);
   _socket.on('exec_flows', socketHandler.execFlows);
   _socket.on('run_flow', socketHandler.runFlow);
});

server.listen(PORT, () => {
   console.log(`Listening on http://localhost:${PORT}`);
});