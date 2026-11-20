// pong, you're the paddle on the right, cpu is on the left. first to 5 wins.
// cpu paddle has a speed cap so it's not impossible to beat, it just tracks
// the ball with a bit of lag
const PongGame = (function () {
  let ctx, hud, onOver;
  const W = 320, H = 400;
  const paddleW = 10, paddleH = 60;
  let playerY, cpuY, ballX, ballY, ballVX, ballVY;
  let playerScore, cpuScore, over, loopId, keyHandler, keyUpHandler;
  let upHeld = false, downHeld = false;

  function reset() {
    playerY = H / 2 - paddleH / 2;
    cpuY = H / 2 - paddleH / 2;
    playerScore = 0;
    cpuScore = 0;
    over = false;
    serveBall();
    updateHud();
  }

  function serveBall() {
    ballX = W / 2;
    ballY = H / 2;
    // random-ish starting angle, slightly favors whoever just lost the point
    ballVX = Math.random() > 0.5 ? 4 : -4;
    ballVY = (Math.random() * 4) - 2;
  }

  function updateHud() {
    let hi = 0;
    try { hi = parseInt(localStorage.getItem('moontech_hi_pong')) || 0; } catch (e) {}
    hud.textContent = 'PONG   YOU ' + playerScore + ' - ' + cpuScore + ' CPU   HI ' + Math.max(hi, playerScore);
  }

  function tick() {
    if (over) return;

    if (upHeld) playerY -= 6;
    if (downHeld) playerY += 6;
    playerY = Math.max(0, Math.min(H - paddleH, playerY));

    // cpu just chases the ball's y position, capped speed so its beatable
    const cpuCenter = cpuY + paddleH / 2;
    if (cpuCenter < ballY - 10) cpuY += 4;
    else if (cpuCenter > ballY + 10) cpuY -= 4;
    cpuY = Math.max(0, Math.min(H - paddleH, cpuY));

    ballX += ballVX;
    ballY += ballVY;

    if (ballY <= 0 || ballY >= H) {
      ballVY *= -1;
      sfxHit();
    }

    // player paddle is on the right side
    if (ballX >= W - paddleW - 10 && ballX <= W - 10 && ballY >= playerY && ballY <= playerY + paddleH) {
      ballVX *= -1.05;
      ballVY += (ballY - (playerY + paddleH / 2)) * 0.1;
      ballX = W - paddleW - 10;
      sfxHit();
    }

    // cpu paddle on the left
    if (ballX <= paddleW + 10 && ballX >= 10 && ballY >= cpuY && ballY <= cpuY + paddleH) {
      ballVX *= -1.05;
      ballVY += (ballY - (cpuY + paddleH / 2)) * 0.1;
      ballX = paddleW + 10;
      sfxHit();
    }

    if (ballX < 0) {
      playerScore++;
      sfxScore();
      updateHud();
      checkWin();
      if (!over) serveBall();
    } else if (ballX > W) {
      cpuScore++;
      updateHud();
      checkWin();
      if (!over) serveBall();
    }

    draw();
  }

  function checkWin() {
    if (playerScore >= 5 || cpuScore >= 5) {
      over = true;
      if (playerScore >= 5) onOver(playerScore);
      sfxGameOver();
      draw();
    }
  }

  function draw() {
    ctx.fillStyle = '#001100';
    ctx.fillRect(0, 0, W, H);

    // dashed center line, just a loop drawing little rects down the middle
    ctx.fillStyle = '#1f8f1f';
    for (let y = 0; y < H; y += 20) {
      ctx.fillRect(W / 2 - 1, y, 2, 10);
    }

    ctx.fillStyle = '#33ff33';
    ctx.fillRect(10, cpuY, paddleW, paddleH);
    ctx.fillRect(W - paddleW - 10, playerY, paddleW, paddleH);
    ctx.fillRect(ballX - 5, ballY - 5, 10, 10);

    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#33ff33';
      ctx.font = '20px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(playerScore >= 5 ? 'YOU WIN' : 'CPU WINS', W / 2, H / 2 - 10);
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
      if (e.key === 'ArrowUp') upHeld = true;
      if (e.key === 'ArrowDown') downHeld = true;

      if (over) {
        reset();
        draw();
      }
    };

    keyUpHandler = function (e) {
      if (e.key === 'ArrowUp') upHeld = false;
      if (e.key === 'ArrowDown') downHeld = false;
    };

    document.addEventListener('keydown', keyHandler);
    document.addEventListener('keyup', keyUpHandler);
  }

  function stop() {
    if (loopId) clearInterval(loopId);
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    if (keyUpHandler) document.removeEventListener('keyup', keyUpHandler);
    upHeld = false;
    downHeld = false;
  }

  return { start, stop };
})();

window.PongGame = PongGame;
