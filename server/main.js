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
   
   console.log('New connection:', socket.id);
   io.in('main').disconnectSockets();
   socket.join("main");
   console.log('ALL SOCKETS', (await io.fetchSockets()).map(sckt => sckt.id));
   // socket.emit('new_connection', { socketID: socket.id });

   socket.on('exec_flows', (data) => FlowHandler.execFlows(data));
   socket.on('stop_execution', () => FlowHandler.stopExecution());
   socket.on('dev_commands.output.get_last_output', () => {
      console.log('[DEV_COMMANDS::OUTPUT] Sending last output...');
      socket.emit('dev_commands.output.set_last_output', { output: FlowHandler.output });
   });
   socket.on('dev_commands.test.custom_command_items', () => ({
      __command_items: [
         {
            icon: "droplets",
            label: "run_test_1",
            dev: true,
            event: 'run_test_1'
         },
         {
            icon: "tilt-shift",
            label: "run_test_2",
            dev: true,
            event: 'run_test_2'
         }
      ]
   }))
});

server.listen(PORT, () => {
   console.log(`Listening on http://localhost:${PORT}`);
});