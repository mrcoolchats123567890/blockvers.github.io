const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.static(__dirname)); // Serve static files from the project root

const players = {};
const gameState = {
    beds: [
        { x: 50, y: 50 },
        { x: 150, y: 150 }
    ],
    players: []
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('setNickname', (nickname) => {
        players[socket.id] = { nickname, x: 100, y: 100 }; // Default starting position
        gameState.players = Object.values(players);
        io.emit('updateGame', gameState);
    });

    socket.on('movePlayer', (direction) => {
        const player = players[socket.id];
        if (player) {
            switch (direction) {
                case 'up':
                    player.y -= 10;
                    break;
                case 'down':
                    player.y += 10;
                    break;
                case 'left':
                    player.x -= 10;
                    break;
                case 'right':
                    player.x += 10;
                    break;
            }
            gameState.players = Object.values(players);
            io.emit('updateGame', gameState);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete players[socket.id];
        gameState.players = Object.values(players);
        io.emit('updateGame', gameState);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
