import { Tetromino } from './tetromino.js';

export class Tetris {
  constructor() {
    // Main game canvas
    this.canvas = document.getElementById('tetris');
    this.ctx = this.canvas.getContext('2d');
    
    // Next piece preview canvas
    this.nextCanvas = document.getElementById('next-piece');
    this.nextCtx = this.nextCanvas.getContext('2d');
    
    // Game properties
    this.gridWidth = 10;
    this.gridHeight = 20;
    this.cellSize = 30; // Increased cell size from 20 to 30
    this.board = this.createEmptyBoard();
    
    // Game state
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.isPaused = true;
    
    // Current and next tetromino
    this.currentPiece = new Tetromino();
    this.nextPiece = new Tetromino();
    
    // Animation frame ID for cancellation
    this.requestId = null;
    
    // Speed settings
    this.dropCounter = 0;
    this.dropInterval = 1000;
    this.lastTime = 0;
    
    // Initialize the game
    this.updateScore();
    this.drawBoard();
    this.drawNextPiece();
    
    // Bind the update method to this instance
    this.boundUpdate = this.update.bind(this);
  }
  
  createEmptyBoard() {
    return Array.from({ length: this.gridHeight }, () => Array(this.gridWidth).fill(0));
  }
  
  drawBoard() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw the grid background
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        this.ctx.strokeStyle = '#333';
        this.ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
      }
    }
    
    // Draw the board
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = this.getColor(value);
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
          
          // Add a 3D effect
          this.ctx.strokeStyle = this.getLighterColor(value);
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(x * this.cellSize, y * this.cellSize);
          this.ctx.lineTo((x + 1) * this.cellSize, y * this.cellSize);
          this.ctx.lineTo((x + 1) * this.cellSize, (y + 1) * this.cellSize);
          this.ctx.stroke();
          
          this.ctx.strokeStyle = this.getDarkerColor(value);
          this.ctx.beginPath();
          this.ctx.moveTo(x * this.cellSize, y * this.cellSize);
          this.ctx.lineTo(x * this.cellSize, (y + 1) * this.cellSize);
          this.ctx.lineTo((x + 1) * this.cellSize, (y + 1) * this.cellSize);
          this.ctx.stroke();
          
          this.ctx.lineWidth = 1;
        }
      });
    });
    
    // Draw the current piece
    if (this.currentPiece) {
      this.currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.ctx.fillStyle = this.getColor(value);
            this.ctx.fillRect(
              (this.currentPiece.x + x) * this.cellSize,
              (this.currentPiece.y + y) * this.cellSize,
              this.cellSize,
              this.cellSize
            );
            
            // Add a 3D effect
            this.ctx.strokeStyle = this.getLighterColor(value);
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo((this.currentPiece.x + x) * this.cellSize, (this.currentPiece.y + y) * this.cellSize);
            this.ctx.lineTo((this.currentPiece.x + x + 1) * this.cellSize, (this.currentPiece.y + y) * this.cellSize);
            this.ctx.lineTo((this.currentPiece.x + x + 1) * this.cellSize, (this.currentPiece.y + y + 1) * this.cellSize);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = this.getDarkerColor(value);
            this.ctx.beginPath();
            this.ctx.moveTo((this.currentPiece.x + x) * this.cellSize, (this.currentPiece.y + y) * this.cellSize);
            this.ctx.lineTo((this.currentPiece.x + x) * this.cellSize, (this.currentPiece.y + y + 1) * this.cellSize);
            this.ctx.lineTo((this.currentPiece.x + x + 1) * this.cellSize, (this.currentPiece.y + y + 1) * this.cellSize);
            this.ctx.stroke();
            
            this.ctx.lineWidth = 1;
          }
        });
      });
    }
  }
  
  drawNextPiece() {
    // Clear the next piece canvas
    this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    
    // Draw background grid
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        this.nextCtx.fillStyle = '#222';
        this.nextCtx.fillRect(x * 30, y * 30, 30, 30);
        this.nextCtx.strokeStyle = '#333';
        this.nextCtx.strokeRect(x * 30, y * 30, 30, 30);
      }
    }
    
    // Calculate center position
    const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * 30) / 2;
    const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * 30) / 2;
    
    // Draw the next piece
    this.nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.nextCtx.fillStyle = this.getColor(value);
          this.nextCtx.fillRect(
            offsetX + x * 30,
            offsetY + y * 30,
            30,
            30
          );
          
          // Add a 3D effect
          this.nextCtx.strokeStyle = this.getLighterColor(value);
          this.nextCtx.lineWidth = 2;
          this.nextCtx.beginPath();
          this.nextCtx.moveTo(offsetX + x * 30, offsetY + y * 30);
          this.nextCtx.lineTo(offsetX + (x + 1) * 30, offsetY + y * 30);
          this.nextCtx.lineTo(offsetX + (x + 1) * 30, offsetY + (y + 1) * 30);
          this.nextCtx.stroke();
          
          this.nextCtx.strokeStyle = this.getDarkerColor(value);
          this.nextCtx.beginPath();
          this.nextCtx.moveTo(offsetX + x * 30, offsetY + y * 30);
          this.nextCtx.lineTo(offsetX + x * 30, offsetY + (y + 1) * 30);
          this.nextCtx.lineTo(offsetX + (x + 1) * 30, offsetY + (y + 1) * 30);
          this.nextCtx.stroke();
          
          this.nextCtx.lineWidth = 1;
        }
      });
    });
  }
  
  getColor(value) {
    const colors = [
      null,
      '#FF0D72', // I
      '#0DC2FF', // J
      '#0DFF72', // L
      '#F538FF', // O
      '#FF8E0D', // S
      '#FFE138', // T
      '#3877FF'  // Z
    ];
    return colors[value];
  }
  
  getLighterColor(value) {
    const lighterColors = [
      null,
      '#FF6C9E', // I
      '#6DDBFF', // J
      '#6DFF9E', // L
      '#F87CFF', // O
      '#FFAE6D', // S
      '#FFEA7C', // T
      '#7CA3FF'  // Z
    ];
    return lighterColors[value];
  }
  
  getDarkerColor(value) {
    const darkerColors = [
      null,
      '#C00046', // I
      '#0096C2', // J
      '#00C246', // L
      '#C00CC2', // O
      '#C26200', // S
      '#C2B500', // T
      '#0046C2'  // Z
    ];
    return darkerColors[value];
  }
  
  moveLeft() {
    this.currentPiece.x--;
    if (this.checkCollision()) {
      this.currentPiece.x++;
    }
    this.drawBoard();
  }
  
  moveRight() {
    this.currentPiece.x++;
    if (this.checkCollision()) {
      this.currentPiece.x--;
    }
    this.drawBoard();
  }
  
  moveDown() {
    this.currentPiece.y++;
    if (this.checkCollision()) {
      this.currentPiece.y--;
      this.mergePiece();
      this.clearLines();
      this.spawnNewPiece();
    }
    this.drawBoard();
    return !this.checkCollision();
  }
  
  hardDrop() {
    while (!this.checkCollision()) {
      this.currentPiece.y++;
    }
    this.currentPiece.y--;
    this.mergePiece();
    this.clearLines();
    this.spawnNewPiece();
    this.drawBoard();
  }
  
  rotate() {
    const originalShape = this.currentPiece.shape;
    
    // Transpose the matrix
    this.currentPiece.shape = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece.shape.map(row => row[i])
    );
    
    // Reverse each row
    this.currentPiece.shape = this.currentPiece.shape.map(row => [...row].reverse());
    
    // Check if the rotation is valid
    if (this.checkCollision()) {
      this.currentPiece.shape = originalShape;
    }
    
    this.drawBoard();
  }
  
  checkCollision() {
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (
          this.currentPiece.shape[y][x] !== 0 &&
          (
            // Check if out of bounds
            this.board[y + this.currentPiece.y] === undefined ||
            this.board[y + this.currentPiece.y][x + this.currentPiece.x] === undefined ||
            // Check if already filled
            this.board[y + this.currentPiece.y][x + this.currentPiece.x] !== 0
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }
  
  mergePiece() {
    this.currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          if (this.board[y + this.currentPiece.y] && this.board[y + this.currentPiece.y][x + this.currentPiece.x] !== undefined) {
            this.board[y + this.currentPiece.y][x + this.currentPiece.x] = value;
          }
        }
      });
    });
  }
  
  clearLines() {
    let linesCleared = 0;
    
    for (let y = this.gridHeight - 1; y >= 0; y--) {
      if (this.board[y].every(value => value !== 0)) {
        // Remove the line
        this.board.splice(y, 1);
        // Add empty line at the top
        this.board.unshift(Array(this.gridWidth).fill(0));
        linesCleared++;
        y++; // Check the same line again
      }
    }
    
    if (linesCleared > 0) {
      // Update score
      this.score += this.getLinesClearedPoints(linesCleared);
      this.lines += linesCleared;
      
      // Update level
      this.level = Math.floor(this.lines / 10) + 1;
      
      // Update speed
      this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
      
      this.updateScore();
    }
  }
  
  getLinesClearedPoints(lines) {
    const pointsPerLine = [0, 40, 100, 300, 1200];
    return pointsPerLine[lines] * this.level;
  }
  
  spawnNewPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = new Tetromino();
    
    // Center the piece horizontally
    this.currentPiece.x = Math.floor((this.gridWidth - this.currentPiece.shape[0].length) / 2);
    this.currentPiece.y = 0;
    
    // Draw the next piece
    this.drawNextPiece();
    
    // Check for game over
    if (this.checkCollision()) {
      this.gameOver = true;
      this.isPaused = true;
      cancelAnimationFrame(this.requestId);
      alert('Game Over! Your score: ' + this.score);
    }
  }
  
  updateScore() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('lines').textContent = this.lines;
    document.getElementById('level').textContent = this.level;
  }
  
  update(time = 0) {
    if (this.isPaused || this.gameOver) {
      // Even when paused, request next frame to ensure we can resume
      this.requestId = requestAnimationFrame(this.boundUpdate);
      return;
    }
    
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    // Ensure deltaTime is reasonable (prevent huge jumps if tab was inactive)
    if (deltaTime > 1000) {
      this.requestId = requestAnimationFrame(this.boundUpdate);
      return;
    }
    
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.moveDown();
      this.dropCounter = 0;
    }
    
    this.drawBoard();
    this.requestId = requestAnimationFrame(this.boundUpdate);
  }
  
  togglePause() {
    if (this.gameOver) {
      // Reset game
      this.board = this.createEmptyBoard();
      this.score = 0;
      this.lines = 0;
      this.level = 1;
      this.gameOver = false;
      this.dropInterval = 1000;
      this.dropCounter = 0;
      this.lastTime = 0;
      this.updateScore();
      this.spawnNewPiece();
    }
    
    this.isPaused = !this.isPaused;
    
    if (!this.isPaused) {
      // Reset timing variables to prevent jumps
      this.lastTime = performance.now();
      this.dropCounter = 0;
      
      // Cancel any existing animation frame to avoid duplicates
      if (this.requestId) {
        cancelAnimationFrame(this.requestId);
      }
      
      // Start the game loop
      this.requestId = requestAnimationFrame(this.boundUpdate);
    }
  }
}
