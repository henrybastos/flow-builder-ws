import express from "express";
import { Server } from "socket.io";
import http from 'http';
import { FlowHandler } from "./FlowHandler.js";

const PORT = 8080;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
   cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"]
   }
});

app.get('/', (req, res) => {
   res.json({ status: 200 });
});


io.on('connection', async (socket) => {
   FlowHandler.setSocket(socket);

   socket.on('exec_flows', (data) => FlowHandler.execFlows(data));
});


server.listen(PORT, () => {
   console.log(`Listening on http://localhost:${PORT}`);
});