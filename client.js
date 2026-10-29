const socket = io();

let currentRoom = null;
let gameState = null;

document.getElementById('createBtn').onclick = () => {
  const playerName = document.getElementById('playerName').value || 'Player 1';
  const playerCount = document.getElementById('playerCount').value;
  const botCount = document.getElementById('botCount').value;
  socket.emit('createRoom', { playerName, playerCount, botCount });
};

document.getElementById('joinBtn').onclick = () => {
  const roomCode = document.getElementById('joinCode').value.toUpperCase();
  const playerName = document.getElementById('playerName').value || 'Player';
  socket.emit('joinRoom', { roomCode, playerName });
};

socket.on('roomCreated', ({ roomCode, game }) => {
  currentRoom = roomCode;
  document.getElementById('roomInfo').innerHTML = `<h3>Room: ${roomCode}</h3><p>Share this code with friends</p>`;
  document.getElementById('lobby').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  gameState = game;
  renderGame();
});

socket.on('gameUpdate', (game) => {
  gameState = game;
  renderGame();
});

document.getElementById('rollBtn').onclick = () => {
  if (currentRoom) socket.emit('rollDice', { roomCode: currentRoom });
};

function renderGame() {
  if (!gameState) return;
  renderPlayers();
  renderBoard();
  renderDice();
  renderLog();
}

function renderPlayers() {
  const container = document.getElementById('playerPanels');
  container.innerHTML = '';
  gameState.players.forEach(p => {
    const div = document.createElement('div');
    div.className = 'player-panel';
    div.style.borderColor = p.color;
    div.innerHTML = `
      <strong style="color:${p.color}">${p.name}${p.isBot ? ' (Bot)' : ''}</strong><br>
      VP: ${p.vp || 0}<br>
      <small>Sci:${p.improvements.science} Trd:${p.improvements.trade} Pol:${p.improvements.politics}</small>
    `;
    container.appendChild(div);
  });
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  const positions = getHexPositions();
  gameState.board.forEach((hex, i) => {
    const div = document.createElement('div');
    div.className = `hex ${hex.terrain}`;
    div.style.left = positions[i].x + 'px';
    div.style.top = positions[i].y + 'px';
    if (hex.number) {
      const num = document.createElement('div');
      num.className = `number ${[6,8].includes(hex.number) ? 'red' : ''}`;
      num.textContent = hex.number;
      div.appendChild(num);
    }
    if (hex.robber) {
      div.innerHTML += '<div style="position:absolute;font-size:24px">🏴</div>';
    }
    board.appendChild(div);
  });
}

function getHexPositions() {
  // Approximate positions for standard Catan hex layout
  const size = 48;
  const positions = [];
  const layout = [
    [0,0],[1,0],[2,0],
    [-0.5,1],[0.5,1],[1.5,1],[2.5,1],
    [-1,2],[0,2],[1,2],[2,2],[3,2],
    [-0.5,3],[0.5,3],[1.5,3],[2.5,3],
    [0,4],[1,4],[2,4]
  ];
  layout.forEach(([q, r]) => {
    positions.push({
      x: 250 + q * size * 1.5,
      y: 40 + r * size * Math.sqrt(3) * 0.85
    });
  });
  return positions;
}

function renderDice() {
  const dice = document.getElementById('dice');
  if (gameState.lastRoll) {
    dice.innerHTML = `
      <div class="die">${gameState.lastRoll.die1}</div>
      <div class="die">${gameState.lastRoll.die2}</div>
      <div class="die" style="background:#c62828;color:white">${gameState.lastRoll.eventDie}</div>
    `;
  }
}

function renderLog() {
  const log = document.getElementById('log');
  log.innerHTML = (gameState.log || []).slice(-5).join('<br>');
}

// Initial render if already in game
if (gameState) renderGame();
