const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store online users
const onlineUsers = new Set();

io.on('connection', (socket) => {
    console.log('New user connected');
    
    // Listen for new user joining
    socket.on('new user', (username) => {
        socket.username = username;
        onlineUsers.add(username);
        io.emit('user joined', username);
        io.emit('online users', Array.from(onlineUsers));
    });

    // Listen for chat messages
    socket.on('chat message', (msg) => {
        io.emit('chat message', { user: socket.username, message: msg });
    });

    // Listen for typing indicator
    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.username);
    });

    // Listen for disconnect
    socket.on('disconnect', () => {
        if (socket.username) {
            onlineUsers.delete(socket.username);
            io.emit('user left', socket.username);
            io.emit('online users', Array.from(onlineUsers));
        }
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});