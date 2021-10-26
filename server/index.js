const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  socket.on('gameObject', (gameObject) => {
    io.emit('gameObject', gameObject);
  });
});

http.listen(4000, function () {
  console.log('listening on port 4000');
});
