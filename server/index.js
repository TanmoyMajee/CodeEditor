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

// Listen for socket connections
io.on('connection', (socket) => {
  console.log('A new client connected:', socket.id);

  // Optionally listen for custom events
  socket.on('message', (data) => {
    console.log(`Message from ${socket.id}:`, data);
    // Optionally, broadcast the message to other clients
    socket.broadcast.emit('message', data);
  });

  // When the client disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
