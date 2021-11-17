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

const rooms = {};

io.on('connection', (socket) => {
  socket.on('join', ({ firstname, roomid }) => {
    //format data
    roomid = roomid?.trim()?.toLowerCase();
    firstname = firstname?.trim()?.toLowerCase();

    //check is creator
    if (
      !rooms[roomid] ||
      !Array.isArray(rooms[roomid]) ||
      rooms[roomid]?.length === 0
    ) {
      rooms[roomid] = [];
    }

    if (rooms[roomid]?.length >= 2) return;

    rooms[roomid].push({ id: socket.id, name: firstname });

    //create room
    socket.join(roomid);

    const isCreator = rooms[roomid]?.[0]?.id == socket.id;

    socket.emit('turn', isCreator ? 'w' : 'b');

    io.in(roomid).emit('guestInfo', {
      name: firstname,
      turn: isCreator ? 'w' : 'b',
      room: rooms[roomid],
    });

    socket.broadcast
      .to(roomid)
      .emit('message', `${firstname} đã tham gia phòng!`, 'reconnect');

    socket.to(roomid).on('disconnect', () => {
      io.emit('message', `${firstname} đã rời phòng!`, 'disconnect');
      rooms[roomid] = [...rooms[roomid].filter((user) => user.id != socket.id)];
      console.log('leaving', rooms[roomid]);
      if (rooms[roomid].length === 0) delete rooms[roomid];
    });

    socket.to(roomid).on('moving', (board) => {
      socket.broadcast.emit('movingData', board);
    });
  });
});

server.listen(port, () => {
  console.log(`Server is supported on port ${port}!`);
});
