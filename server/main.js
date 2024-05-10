import express from "express";
import { Server } from "socket.io";
import http from 'http';
import { Browser } from "./Browser.js";
import { Operations } from "./Operations.js";

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


io.on('connection', async (socket) => {
   // Custom method for emitting and logging a payload
   socket._emit = (event, details) => {
      socket.emit(event, details);

      for (let [msgType, msg] of Object.entries(details)) {
         console.log(`[${ msgType.toUpperCase() }] ${ msg }`);
      }
   }

   Operations.setSocket(socket);

   socket.on('chat_message', (msg) => {
      console.log('[chat_message]', msg);
   });
   
   socket.on('run_flow', async () => {
      await Browser.launch();
      await Operations.goto('https://tabler.io/icons/icon/player-play');
      await Operations.eval('window.location.href');

      socket._emit('operation_log', { done: 'Flow done' });
   })
});

server.listen(PORT, () => {
   console.log(`Listening on http://localhost:${PORT}`);
});