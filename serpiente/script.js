const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");

const tileSize = 24;
const gridSize = canvas.width / tileSize;
const startSpeed = 125;

let snake;
let direction;
let nextDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem("snakeBest") || 0);
let gameOver;
let paused;
let loopId;

bestEl.textContent = String(bestScore);

function randomCell() {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
  };
}

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function spawnFood() {
  let candidate = randomCell();
  while (snake.some((part) => sameCell(part, candidate))) {
    candidate = randomCell();
  }
  return candidate;
}

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  food = spawnFood();
  score = 0;
  gameOver = false;
  paused = false;
  scoreEl.textContent = "0";
  statusEl.textContent = "";

  if (loopId) {
    clearInterval(loopId);
  }
  loopId = setInterval(tick, startSpeed);
  draw();
}

function setStatus(message) {
  statusEl.textContent = message;
}

function endGame() {
  gameOver = true;
  clearInterval(loopId);
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snakeBest", String(bestScore));
    bestEl.textContent = String(bestScore);
  }
  setStatus("Has perdido. Pulsa Espacio para jugar otra vez.");
}

function tick() {
  if (paused || gameOver) {
    return;
  }

  direction = nextDirection;
  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  if (
    newHead.x < 0 ||
    newHead.x >= gridSize ||
    newHead.y < 0 ||
    newHead.y >= gridSize
  ) {
    endGame();
    draw();
    return;
  }

  const collided = snake.some((part) => sameCell(part, newHead));
  if (collided) {
    endGame();
    draw();
    return;
  }

  snake.unshift(newHead);

  if (sameCell(newHead, food)) {
    score += 1;
    scoreEl.textContent = String(score);
    food = spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function drawGrid() {
  ctx.strokeStyle = "rgba(148, 163, 184, 0.13)";
  ctx.lineWidth = 1;
  for (let i = 1; i < gridSize; i += 1) {
    const p = i * tileSize;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

function drawRect(cell, color) {
  const gap = 2;
  ctx.fillStyle = color;
  ctx.fillRect(
    cell.x * tileSize + gap,
    cell.y * tileSize + gap,
    tileSize - gap * 2,
    tileSize - gap * 2
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  drawRect(food, "#f97316");

  snake.forEach((part, idx) => {
    drawRect(part, idx === 0 ? "#22c55e" : "#4ade80");
  });

  if (paused && !gameOver) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.58)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 36px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("PAUSA", canvas.width / 2, canvas.height / 2);
  }
}

function updateDirection(key) {
  if (gameOver) {
    return;
  }

  const map = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  };

  const next = map[key];
  if (!next) {
    return;
  }

  const opposite = direction.x + next.x === 0 && direction.y + next.y === 0;
  if (!opposite) {
    nextDirection = next;
  }
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (event.key === " " && gameOver) {
    resetGame();
    return;
  }

  if (event.key.toLowerCase() === "p" && !gameOver) {
    paused = !paused;
    setStatus(paused ? "Pausa activada." : "");
    draw();
    return;
  }

  updateDirection(event.key.length === 1 ? event.key.toLowerCase() : event.key);
});

resetGame();
