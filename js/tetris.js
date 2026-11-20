// simplified falling blocks game, basically tetris but i didn't bother with
// the official rotation system (SRS) or a next-piece preview, just a plain
// rotate-around-center that works well enough for most of the pieces.
// grid is 10 wide, 20 tall, 18px cells -> 180x360 canvas
const TetrisGame = (function () {
  let ctx, hud, onOver;
  const cols = 10, rows = 20, cell = 18;
  const W = cols * cell, H = rows * cell;

  // each shape is a list of [x,y] offsets from a center point. rotating is
  // just (x,y) -> (-y,x) applied to every offset, except for O which is
  // square and doesn't need it
  const shapes = {
    I: { cells: [[-1, 0], [0, 0], [1, 0], [2, 0]], id: 1 },
    O: { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], id: 2, noRotate: true },
    T: { cells: [[-1, 0], [0, 0], [1, 0], [0, -1]], id: 3 },
    S: { cells: [[-1, 0], [0, 0], [0, -1], [1, -1]], id: 4 },
    Z: { cells: [[1, 0], [0, 0], [0, -1], [-1, -1]], id: 5 },
    J: { cells: [[-1, -1], [-1, 0], [0, 0], [1, 0]], id: 6 },
    L: { cells: [[1, -1], [-1, 0], [0, 0], [1, 0]], id: 7 }
  };
  const shadeById = { 1: '#33ff33', 2: '#2be62b', 3: '#26cc26', 4: '#20b320', 5: '#1a991a', 6: '#167d16', 7: '#125f12' };
  const names = Object.keys(shapes);

  let board, cur, curX, curY, score, lines, level, over, loopId, keyHandler, dropDelay;

  function newPiece() {
    const name = names[Math.floor(Math.random() * names.length)];
    return { name: name, cells: shapes[name].cells.map(c => c.slice()), id: shapes[name].id, noRotate: shapes[name].noRotate };
  }

  function emptyBoard() {
    const b = [];
    for (let r = 0; r < rows; r++) b.push(new Array(cols).fill(0));
    return b;
  }

  function reset() {
    board = emptyBoard();
    score = 0;
    lines = 0;
    level = 1;
    dropDelay = 500;
    over = false;
    spawn();
    updateHud();
  }

  function spawn() {
    cur = newPiece();
    curX = 4;
    curY = 1;
    if (collides(cur.cells, curX, curY)) {
      over = true;
      onOver(score);
      sfxGameOver();
    }
  }

  function collides(cells, x, y) {
    return cells.some(([dx, dy]) => {
      const bx = x + dx, by = y + dy;
      if (bx < 0 || bx >= cols || by >= rows) return true;
      if (by < 0) return false;
      return board[by][bx] !== 0;
    });
  }

  function lockPiece() {
    cur.cells.forEach(([dx, dy]) => {
      const bx = curX + dx, by = curY + dy;
      if (by >= 0) board[by][bx] = cur.id;
    });

    let cleared = 0;
    for (let r = rows - 1; r >= 0; r--) {
      if (board[r].every(v => v !== 0)) {
        board.splice(r, 1);
        board.unshift(new Array(cols).fill(0));
        cleared++;
        r++; // recheck same row index since everything shifted down
      }
    }

    if (cleared > 0) {
      lines += cleared;
      score += cleared * 100 * cleared; // multi line clears score a bit extra
      sfxLineClear();
      // every 5 lines bumps the speed up a bit, caps out so it doesn't get silly
      level = Math.floor(lines / 5) + 1;
      dropDelay = Math.max(120, 500 - (level - 1) * 40);
      updateHud();
    }

    spawn();
  }

  function updateHud() {
    let hi = 0;
    try { hi = parseInt(localStorage.getItem('moontech_hi_tetris')) || 0; } catch (e) {}
    hud.textContent = 'BLOCKS   SCORE ' + score + '   LINES ' + lines + '   HI ' + Math.max(hi, score);
  }

  function tick() {
    if (over) return;
    if (!collides(cur.cells, curX, curY + 1)) {
      curY++;
    } else {
      lockPiece();
    }
    draw();
  }

  function move(dx) {
    if (!collides(cur.cells, curX + dx, curY)) curX += dx;
  }

  function rotate() {
    if (cur.noRotate) return;
    const rotated = cur.cells.map(([x, y]) => [-y, x]);
    if (!collides(rotated, curX, curY)) {
      cur.cells = rotated;
    } else if (!collides(rotated, curX - 1, curY)) {
      // basic wall kick, just nudge it sideways if the straight rotation doesn't fit
      curX -= 1;
      cur.cells = rotated;
    } else if (!collides(rotated, curX + 1, curY)) {
      curX += 1;
      cur.cells = rotated;
    }
  }

  function draw() {
    ctx.fillStyle = '#001100';
    ctx.fillRect(0, 0, W, H);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] !== 0) {
          ctx.fillStyle = shadeById[board[r][c]];
          ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
        }
      }
    }

    ctx.fillStyle = '#a6ffa6';
    cur.cells.forEach(([dx, dy]) => {
      const bx = curX + dx, by = curY + dy;
      if (by >= 0) ctx.fillRect(bx * cell, by * cell, cell - 1, cell - 1);
    });

    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#33ff33';
      ctx.font = '16px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
      ctx.font = '11px Courier New';
      ctx.fillText('press any key to retry', W / 2, H / 2 + 14);
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
    loopId = setInterval(tick, dropDelay);

    // restarting the interval whenever dropDelay changes would be a pain,
    // so instead just run a fast ticking clock and only actually drop when
    // enough time has passed. simpler than rebuilding the interval each time
    clearInterval(loopId);
    let last = 0;
    loopId = setInterval(function () {
      last += 16;
      if (last >= dropDelay) {
        last = 0;
        tick();
      }
    }, 16);

    keyHandler = function (e) {
      if (over) {
        if (e.key) { reset(); draw(); }
        return;
      }
      if (e.key === 'ArrowLeft') { move(-1); draw(); }
      else if (e.key === 'ArrowRight') { move(1); draw(); }
      else if (e.key === 'ArrowDown') { tick(); }
      else if (e.key === 'ArrowUp') { rotate(); draw(); }
    };

    document.addEventListener('keydown', keyHandler);
  }

  function stop() {
    if (loopId) clearInterval(loopId);
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
  }

  return { start, stop };
})();

window.TetrisGame = TetrisGame;
