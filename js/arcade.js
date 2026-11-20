// this file just handles the menu and switching between games. each actual
// game lives in its own js file and exposes a start/stop pair on window,
// this just calls whichever one got picked

const games = ['snake', 'pong', 'breakout', 'tetris'];
let selected = 0;
let activeGame = null;

const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const menuItems = document.querySelectorAll('#menuList li');
const hud = document.getElementById('hud');
const canvas = document.getElementById('game');

// pull saved high scores out of localStorage and show them next to each
// game name in the menu. wrapped in try/catch since some browsers (private
// windows etc) throw on this instead of just returning null
function loadHighScores() {
  games.forEach(name => {
    let score = 0;
    try {
      score = parseInt(localStorage.getItem('moontech_hi_' + name)) || 0;
    } catch (e) {
      score = 0;
    }
    const el = document.getElementById('hi' + name.charAt(0).toUpperCase() + name.slice(1));
    if (el && score > 0) el.textContent = 'HI ' + score;
  });
}

function saveHighScore(name, score) {
  try {
    const current = parseInt(localStorage.getItem('moontech_hi_' + name)) || 0;
    if (score > current) {
      localStorage.setItem('moontech_hi_' + name, score);
    }
  } catch (e) {
    // no storage, no biggie, just wont remember next time
  }
}

function updateMenuHighlight() {
  menuItems.forEach((item, i) => {
    item.classList.toggle('selected', i === selected);
  });
}

function startSelectedGame() {
  const name = games[selected];
  menuScreen.style.display = 'none';
  gameScreen.style.display = 'block';

  const gameMap = {
    snake: window.SnakeGame,
    pong: window.PongGame,
    breakout: window.BreakoutGame,
    tetris: window.TetrisGame
  };

  activeGame = gameMap[name];
  activeGame.start(canvas, hud, score => saveHighScore(name, score));
}

function backToMenu() {
  if (activeGame) {
    activeGame.stop();
    activeGame = null;
  }
  gameScreen.style.display = 'none';
  menuScreen.style.display = 'block';
  loadHighScores();
}

document.addEventListener('keydown', function (e) {
  const inMenu = menuScreen.style.display !== 'none';

  if (inMenu) {
    if (e.key === 'ArrowUp') {
      selected = (selected - 1 + games.length) % games.length;
      updateMenuHighlight();
    } else if (e.key === 'ArrowDown') {
      selected = (selected + 1) % games.length;
      updateMenuHighlight();
    } else if (e.key === 'Enter') {
      startSelectedGame();
    }
  } else if (e.key === 'Escape') {
    backToMenu();
  }
});

loadHighScores();
