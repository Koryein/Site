// classic snake, 20x20 grid at 16px cells so the canvas ends up 320x320.
// exposes SnakeGame.start/stop so arcade.js can boot it from the menu
const SnakeGame = (function () {
  let ctx, hud, onOver;
  let cell = 16, gridSize = 20;
  let snake, dir, nextDir, food, score, loopId, keyHandler, dead;

  function randomFood() {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  }

  function reset() {
    snake = [{ x: 10, y: 10 }];
    dir = { x: 0, y: 0 };
    nextDir = { x: 0, y: 0 };
    food = randomFood();
    score = 0;
    dead = false;
    updateHud();
  }

  function updateHud() {
    let hi = 0;
    try { hi = parseInt(localStorage.getItem('moontech_hi_snake')) || 0; } catch (e) {}
    hud.textContent = 'SNAKE   SCORE ' + score + '   HI ' + Math.max(hi, score);
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    const hitWall = head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize;
    const hitSelf = snake.some(s => s.x === head.x && s.y === head.y);

    if (hitWall || hitSelf) {
      dead = true;
      sfxGameOver();
      onOver(score);
      draw();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      sfxScore();
      updateHud();
      food = randomFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = '#001100';
    ctx.fillRect(0, 0, 320, 320);

    ctx.fillStyle = '#33ff33';
    for (let i = 0; i < snake.length; i++) {
      ctx.fillRect(snake[i].x * cell, snake[i].y * cell, cell - 1, cell - 1);
    }

    ctx.fillStyle = '#ff3333';
    ctx.fillRect(food.x * cell, food.y * cell, cell - 1, cell - 1);

    if (dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, 320, 320);
      ctx.fillStyle = '#33ff33';
      ctx.font = '20px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 160, 150);
      ctx.font = '12px Courier New';
      ctx.fillText('press any arrow to retry', 160, 174);
    }
  }

  function start(canvasEl, hudEl, onGameOver) {
    canvasEl.width = 320;
    canvasEl.height = 320;
    ctx = canvasEl.getContext('2d');
    hud = hudEl;
    onOver = onGameOver;

    reset();
    draw();

    let started = false;

    keyHandler = function (e) {
      if (e.key === 'ArrowUp' && dir.y === 0) nextDir = { x: 0, y: -1 };
      else if (e.key === 'ArrowDown' && dir.y === 0) nextDir = { x: 0, y: 1 };
      else if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = { x: -1, y: 0 };
      else if (e.key === 'ArrowRight' && dir.x === 0) nextDir = { x: 1, y: 0 };
      else return;

      if (dead) {
        reset();
        started = false;
        draw();
        return;
      }

      if (!started) {
        started = true;
        loopId = setInterval(tick, 110);
      }
    };

    document.addEventListener('keydown', keyHandler);
  }

  function stop() {
    if (loopId) clearInterval(loopId);
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    loopId = null;
  }

  return { start, stop };
})();

window.SnakeGame = SnakeGame;
