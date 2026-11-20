// basic snake game, nothing crazy. grid is 20x20, each cell is 16px so the
// canvas works out to 320x320
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const cell = 16;
const gridSize = 20;

let snake = [{ x: 10, y: 10 }];
let dir = { x: 0, y: 0 };
let nextDir = { x: 0, y: 0 };
let food = randomFood();
let score = 0;
let gameStarted = false;
let gameOver = false;
let loopId = null;

function randomFood() {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
  };
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowUp' && dir.y === 0) nextDir = { x: 0, y: -1 };
  else if (e.key === 'ArrowDown' && dir.y === 0) nextDir = { x: 0, y: 1 };
  else if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = { x: -1, y: 0 };
  else if (e.key === 'ArrowRight' && dir.x === 0) nextDir = { x: 1, y: 0 };
  else return;

  if (!gameStarted) {
    gameStarted = true;
    document.querySelector('.blink').style.display = 'none';
    loopId = setInterval(tick, 110);
  }

  if (gameOver) {
    // restart on keypress after dying
    resetGame();
  }
});

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  dir = { x: 0, y: 0 };
  nextDir = { x: 0, y: 0 };
  food = randomFood();
  score = 0;
  gameOver = false;
  gameStarted = false;
  document.getElementById('score').textContent = 'SCORE: 0';
  document.querySelector('.blink').style.display = 'block';
  if (loopId) clearInterval(loopId);
  draw();
}

function tick() {
  dir = nextDir;

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // wall or self collision ends it
  const hitWall = head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize;
  const hitSelf = snake.some(s => s.x === head.x && s.y === head.y);

  if (hitWall || hitSelf) {
    clearInterval(loopId);
    gameOver = true;
    drawGameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    document.getElementById('score').textContent = 'SCORE: ' + score;
    food = randomFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = '#001100';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#33ff33';
  for (let i = 0; i < snake.length; i++) {
    ctx.fillRect(snake[i].x * cell, snake[i].y * cell, cell - 1, cell - 1);
  }

  ctx.fillStyle = '#ff3333';
  ctx.fillRect(food.x * cell, food.y * cell, cell - 1, cell - 1);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#33ff33';
  ctx.font = '20px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '12px Courier New';
  ctx.fillText('press any arrow to retry', canvas.width / 2, canvas.height / 2 + 14);
}

draw();
