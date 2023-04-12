const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });
const path = require('path');

const tasks = [];

io.on('connection', (socket) => {
    console.log('New client! Its id – ' + socket.id);

    socket.emit('updateData', tasks);

    socket.on('addTask', ({ description, id }) => {
        tasks.push({ description, id });
        socket.broadcast.emit('addTask', { description, id });
    });

    socket.on('removeTask', (id) => {
        const index = tasks.findIndex((element) => element.id == id);
        if (index != -1) {
            tasks.splice(index, 1);
        }
        socket.broadcast.emit('removeTask', id);
    });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Catch all other routes and return the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Add this middleware to handle 404 errors
app.use((req, res) => {
    res.status(404).send('Not found');
});

// Start the server and listen on port 8000
const serverPort = 8000;
server.listen(serverPort, () => {
    console.log(`Server is running on port ${serverPort}`);
});