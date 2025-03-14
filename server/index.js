const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

// Create an HTTP server and attach Express app to it
const server = http.createServer(app);

// Initialize a new instance of socket.io by passing the server
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust the CORS settings as needed
    methods: ["GET", "POST"]
  }
});

// Define a route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Map to store the username for each socket connection
const userSocketMap = {};
// Map to store the current code for each room
const roomCodeMap = {};
const getUsersFun = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId]
    };
  }
)
};
// Listen for socket connections
io.on('connection', (socket) => {
  console.log('A new client connected:', socket.id);

  // Optionally listen for custom events
  socket.on('message', (data) => {
    console.log(`Message from ${socket.id}:`, data);
    // Optionally, broadcast the message to other clients
    socket.broadcast.emit('message', data);
  });

  socket.on('join-room' , (data) => {
    const {roomId , username} = data;
    userSocketMap[socket.id] = username;
    socket.join(roomId)
    console.log( username , " : Room Joined" , roomId);
    const clients = getUsersFun(roomId);
    console.log(clients);
    io.to(roomId).emit('ConnectedUsers' , clients);
    socket.to(roomId).emit('user-joined', username);
      // If there is existing code for the room, send it to the newly joined client
    if (roomCodeMap[roomId]) {
      socket.emit('initial-code', roomCodeMap[roomId]);
    }
  });

   // Listen for a client explicitly leaving a room
  socket.on('leave-room', (data) => {
    const { roomId, username } = data;
    // Leave the specified room
    socket.leave(roomId);
    // Remove the user from our mapping
    delete userSocketMap[socket.id];
    console.log(username, "left room", roomId);
    
    // Update and broadcast the new list of connected users
    const clients = getUsersFun(roomId);
    io.to(roomId).emit('ConnectedUsers', clients);
    // Notify other clients that this user left
    socket.to(roomId).emit('user-left', username);
  });

    // Listen for code changes
  socket.on('code-change', (data) => {
    const { roomId, code } = data;
    roomCodeMap[roomId] = code;
    // Broadcast the code change to other clients in the room
    socket.to(roomId).emit('code-update', code);
  });

  // Handle socket disconnection (e.g., network issues, browser closed)
  socket.on('disconnecting', () => {
    // console.log('Client disconnected:', socket.id);
    
    // Iterate over all rooms this socket was part of (excluding its own default room)
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        // Notify others in the room that the user has left
        socket.to(roomId).emit('user-left', userSocketMap[socket.id]);
        // Remove the disconnected socket's entry from our map
    delete userSocketMap[socket.id];
    socket.leave(roomId);
        // Update and broadcast the new user list for the room
        const clients = getUsersFun(roomId);
        io.to(roomId).emit('ConnectedUsers', clients);
      }
    });
  
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
