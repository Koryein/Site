// breakout. left/right arrows move the paddle, ball bounces around and
// breaks bricks. 3 lives, clear the board to win
const BreakoutGame = (function () {
  let ctx, hud, onOver;
  const W = 320, H = 400;
  const paddleW = 60, paddleH = 10;
  const rows = 5, cols = 8;
  const brickW = 36, brickH = 14, brickGap = 4, brickTop = 40;

  let paddleX, ballX, ballY, ballVX, ballVY, bricks, score, lives, over, won, loopId, keyHandler;
  let leftHeld = false, rightHeld = false;

  function buildBricks() {
    bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: 8 + c * (brickW + brickGap),
          y: brickTop + r * (brickH + brickGap),
          alive: true,
          // just rotate through a few shades so the rows look slightly different
          row: r
        });
      }
    }
  }

  function reset() {
    paddleX = W / 2 - paddleW / 2;
    ballX = W / 2;
    ballY = H - 60;
    ballVX = 3;
    ballVY = -4;
    score = 0;
    lives = 3;
    over = false;
    won = false;
    buildBricks();
    updateHud();
  }

  function updateHud() {
    let hi = 0;
    try { hi = parseInt(localStorage.getItem('moontech_hi_breakout')) || 0; } catch (e) {}
    hud.textContent = 'BREAKOUT   SCORE ' + score + '   LIVES ' + lives + '   HI ' + Math.max(hi, score);
  }

  function tick() {
    if (over) return;

    if (leftHeld) paddleX -= 6;
    if (rightHeld) paddleX += 6;
    paddleX = Math.max(0, Math.min(W - paddleW, paddleX));

    ballX += ballVX;
    ballY += ballVY;

    if (ballX <= 5 || ballX >= W - 5) ballVX *= -1;
    if (ballY <= 5) ballVY *= -1;

    // paddle hit
    if (ballY >= H - 30 - 5 && ballY <= H - 30 + 5 && ballX >= paddleX && ballX <= paddleX + paddleW) {
      ballVY *= -1;
      // hitting off center angles the ball a bit, same trick as the pong paddle
      ballVX += (ballX - (paddleX + paddleW / 2)) * 0.05;
      sfxHit();
    }

    // brick collisions, just a plain loop checking each alive brick
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!b.alive) continue;
      if (ballX >= b.x && ballX <= b.x + brickW && ballY >= b.y && ballY <= b.y + brickH) {
        b.alive = false;
        ballVY *= -1;
        score += 10;
        sfxScore();
        updateHud();
        break;
      }
    }

    if (bricks.every(b => !b.alive)) {
      won = true;
      over = true;
      onOver(score);
      sfxGameOver();
    }

    if (ballY > H) {
      lives--;
      updateHud();
      if (lives <= 0) {
        over = true;
        onOver(score);
        sfxGameOver();
      } else {
        ballX = W / 2;
        ballY = H - 60;
        ballVX = 3;
        ballVY = -4;
      }
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = '#001100';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#33ff33';
    bricks.forEach(b => {
      if (b.alive) ctx.fillRect(b.x, b.y, brickW, brickH);
    });

    ctx.fillRect(paddleX, H - 30, paddleW, paddleH);
    ctx.fillRect(ballX - 4, ballY - 4, 8, 8);

    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#33ff33';
      ctx.font = '20px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(won ? 'CLEARED!' : 'GAME OVER', W / 2, H / 2 - 10);
      ctx.font = '12px Courier New';
      ctx.fillText('press any key to play again', W / 2, H / 2 + 14);
    }
  }

  function start(canvasEl, hudEl, onGameOver) {
    canvasEl.width = W;
    canvasEl.height = H;
    ctx = canvasEl.getContext('2d');
    hud = hudEl;
    onOver = onGameOver;

    reset();
    draw();
    loopId = setInterval(tick, 1000 / 60);

    keyHandler = function (e) {
      if (e.key === 'ArrowLeft') leftHeld = true;
      if (e.key === 'ArrowRight') rightHeld = true;
      if (over) {
        reset();
        draw();
      }
    };

    document.addEventListener('keydown', keyHandler);
    document.addEventListener('keyup', keyUpHandler);
  }

  function keyUpHandler(e) {
    if (e.key === 'ArrowLeft') leftHeld = false;
    if (e.key === 'ArrowRight') rightHeld = false;
  }

  function stop() {
    if (loopId) clearInterval(loopId);
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    document.removeEventListener('keyup', keyUpHandler);
    leftHeld = false;
    rightHeld = false;
  }

  return { start, stop };
})();

window.BreakoutGame = BreakoutGame;
