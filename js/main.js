import { Tetris } from './tetris.js';

document.addEventListener('DOMContentLoaded', () => {
  const tetris = new Tetris();
  
  // Start button event listener
  document.getElementById('start-button').addEventListener('click', () => {
    tetris.togglePause();
  });

  // Keyboard controls
  document.addEventListener('keydown', (event) => {
    if (tetris.gameOver) return;

    switch (event.key) {
      case 'ArrowLeft':
        tetris.moveLeft();
        event.preventDefault();
        break;
      case 'ArrowRight':
        tetris.moveRight();
        event.preventDefault();
        break;
      case 'ArrowDown':
        tetris.moveDown();
        event.preventDefault();
        break;
      case 'ArrowUp':
        tetris.rotate();
        event.preventDefault();
        break;
      case ' ':
        tetris.hardDrop();
        event.preventDefault();
        break;
      case 'p':
      case 'P':
        tetris.togglePause();
        event.preventDefault();
        break;
    }
  });
});
