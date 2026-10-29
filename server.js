const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

// True random helper
function randomInt(min, max) {
  return crypto.randomInt(min, max + 1);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Game state storage
const rooms = {};

const TERRAINS = ['forest', 'pasture', 'fields', 'hills', 'mountains', 'desert'];
const RESOURCES = ['lumber', 'wool', 'grain', 'brick', 'ore'];
const COMMODITIES = ['paper', 'cloth', 'coin'];

// Standard board numbers for 3-4 players
const NUMBERS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('createRoom', ({ playerName, playerCount, botCount }) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[roomCode] = {
      code: roomCode,
      players: [{ id: socket.id, name: playerName, color: 'red', isBot: false, resources: {}, commodities: {}, progress: [], improvements: { science: 0, trade: 0, politics: 0 }, vp: 0, knights: [] }],
      playerCount: parseInt(playerCount),
      botCount: parseInt(botCount),
      currentTurn: 0,
      phase: 'setup',
      board: generateBoard(),
      progressDecks: generateProgressDecks(),
      barbarianPosition: 0,
      log: []
    };
    // Add bots
    const colors = ['blue', 'orange', 'green', 'purple', 'white'];
    for (let i = 0; i < botCount; i++) {
      rooms[roomCode].players.push({
        id: `bot${i}`,
        name: `Bot ${i + 1}`,
        color: colors[i],
        isBot: true,
        resources: {},
        commodities: {},
        progress: [],
        improvements: { science: 0, trade: 0, politics: 0 },
        vp: 0,
        knights: []
      });
    }
    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode, game: rooms[roomCode] });
    io.to(roomCode).emit('gameUpdate', rooms[roomCode]);
  });

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = rooms[roomCode];
    if (room && room.players.length < room.playerCount) {
      const colors = ['red', 'blue', 'orange', 'green', 'purple'];
      room.players.push({
        id: socket.id,
        name: playerName,
        color: colors[room.players.length],
        isBot: false,
        resources: {},
        commodities: {},
        progress: [],
        improvements: { science: 0, trade: 0, politics: 0 },
        vp: 0,
        knights: []
      });
      socket.join(roomCode);
      io.to(roomCode).emit('gameUpdate', room);
    } else {
      socket.emit('error', 'Room full or not found');
    }
  });

  socket.on('rollDice', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
    const die1 = randomInt(1, 6);
    const die2 = randomInt(1, 6);
    const eventDie = randomInt(1, 6); // 1-3 barbarian, 4 science, 5 trade, 6 politics (simplified)
    const total = die1 + die2;
    room.lastRoll = { die1, die2, eventDie, total };
    // Handle production, barbarian, progress draw truly randomly
    handleRoll(room, total, eventDie);
    io.to(roomCode).emit('gameUpdate', room);
    // Advance turn if bots, etc.
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

function generateBoard() {
  // Simplified hex board for 3-4 players
  const hexes = [];
  const terrains = shuffle([...Array(4).fill('forest'), ...Array(4).fill('pasture'), ...Array(4).fill('fields'), ...Array(3).fill('hills'), ...Array(3).fill('mountains'), 'desert']);
  const numbers = shuffle(NUMBERS);
  let numIndex = 0;
  for (let i = 0; i < 19; i++) {
    const terrain = terrains[i];
    hexes.push({
      id: i,
      terrain,
      number: terrain === 'desert' ? null : numbers[numIndex++],
      robber: terrain === 'desert'
    });
  }
  return hexes;
}

function generateProgressDecks() {
  // Truly random shuffle of progress cards
  const science = Array(18).fill('science').map((_, i) => ({ type: 'science', id: i, name: `Science Card ${i}` }));
  const trade = Array(18).fill('trade').map((_, i) => ({ type: 'trade', id: i, name: `Trade Card ${i}` }));
  const politics = Array(18).fill('politics').map((_, i) => ({ type: 'politics', id: i, name: `Politics Card ${i}` }));
  return {
    science: shuffle(science),
    trade: shuffle(trade),
    politics: shuffle(politics)
  };
}

function handleRoll(room, total, eventDie) {
  // Production logic (simplified)
  room.log.push(`Rolled ${total} (event ${eventDie})`);
  // Add true random progress draw logic here based on improvements
  // Barbarian advance if eventDie <=3
  if (eventDie <= 3) {
    room.barbarianPosition = Math.min(7, room.barbarianPosition + 1);
    if (room.barbarianPosition >= 7) {
      room.log.push('Barbarians attack!');
      room.barbarianPosition = 0;
    }
  }
  // Progress cards drawn randomly from shuffled decks
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Catan Cities & Knights server running on port ${PORT}`);
});
