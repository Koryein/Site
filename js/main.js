// little easter egg thing, click the dot in the footer 5 times within 3 seconds
// and it bounces you to the retro page. kept it simple, nothing fancy needed here
let eggClicks = 0;
let eggTimer = null;

const dot = document.getElementById('eggDot');

if (dot) {
  dot.addEventListener('click', function () {
    eggClicks++;

    if (eggTimer) clearTimeout(eggTimer);
    eggTimer = setTimeout(() => {
      eggClicks = 0;
    }, 3000);

    if (eggClicks >= 5) {
      // figure out how deep we are in the folder structure so the link still works
      // from both the homepage and from inside /blog/
      const inBlog = window.location.pathname.includes('/blog/');
      window.location.href = inBlog ? '../retro.html' : 'retro.html';
    }
  });
}
