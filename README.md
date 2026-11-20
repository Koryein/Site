# moontech3point1.online

Personal blog / about me site. Plain HTML, CSS and JS, no build step or framework, just
upload the files straight to hosting.

## Structure

- `index.html` - homepage, lists blog posts
- `about.html` - about page
- `blog/` - individual post pages
- `css/style.css` - all the styling
- `js/main.js` - small stuff, mainly the footer easter egg trigger
- `retro.html` - hidden arcade page, pick a game from the menu with arrow keys + enter
- `js/arcade.js` - menu/game switcher and high score storage for the arcade page
- `js/sound.js` - shared beep sounds the games use
- `js/snake.js`, `js/pong.js`, `js/breakout.js`, `js/tetris.js` - the actual games

## Adding a new post

Copy `blog/hello-world.html`, rename it, swap the content, then add a card for it in
`index.html`'s post list section.

## Deploying

Hosted on GitHub Pages, with moontech3point1.online pointed at it via DNS. Upload these
files to the repo (keeping the folder structure as-is), turn on Pages in repo settings,
then add the custom domain there.
