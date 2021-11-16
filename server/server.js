const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 8000;
const publicDirectoryPath = path.join(__dirname, './public');

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on('connection', (socket) => {
  socket.emit('message', 'Welcome to chess game. Enjoy your moment!');
  socket.on('increment', () => {
    count++;
    // socket.emit('countUpdated', count);
    io.emit('message', count);
  });
});

server.listen(port, () => {
  console.log(`Server is supported on port ${port}!`);
});
