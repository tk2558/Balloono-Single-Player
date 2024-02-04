const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 1337;
let playerNum = 1;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname)));

// Handle requests to the root URL by serving index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log(`Player${playerNum} connected`);
    playerNum++;

    socket.on('message', (msg) => {;
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running in http://localhost:${port}...`);
});
