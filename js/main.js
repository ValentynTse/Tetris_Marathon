import {
   PLAYFIELD_COLUMNS,
   PLAYFIELD_ROWS,
   TETROMINO_NAMES,
   TETROMINOES,
   gameOverBlock,
   btnRestart
} from './utilities.js';

let playField,
   tetromino,
   timeoutId,
   requestId,
   cells,
   score = 0,
   isPaused = false,
   isGameOver = false;
init();

function init() {
   gameOverBlock.style.display = 'none';
   isGameOver = false;
   generatePlayfield();
   generateTetromino();
   startLoop();
   cells = document.querySelectorAll('.tetris div');
   score = 0;
   countScore(null);
}

document.addEventListener('keydown', onKeyDown);
btnRestart.addEventListener('click', function () {
   init();
});

function togglePauseGame() {
   isPaused = !isPaused;

   if (isPaused) {
      stopLoop();
   } else {
      startLoop();
   }
}

function onKeyDown(e) {
   // console.log(e);
   if (e.key == 'p') {
      togglePauseGame();
   }
   if (isPaused) {
      return
   }
   switch (e.key) {
      case ' ':
         dropTetrominoDown();
         break;
      case 'ArrowUp':
         rotateTetromino();
         break;
      case 'ArrowDown':
         moveTetrominoDown();
         break;
      case 'ArrowLeft':
         moveTetrominoLeft();
         break;
      case 'ArrowRight':
         moveTetrominoRight();
         break;
   }
   draw();
}

function dropTetrominoDown() {
   while (!isValid()) {
      tetromino.row++;
   }
   tetromino.row--;
}

function moveTetrominoDown() {
   tetromino.row += 1;
   if (isValid()) {
      tetromino.row -= 1
      placeTetromino();
   }
}

function moveTetrominoRight() {
   tetromino.column += 1;
   if (isValid()) {
      tetromino.column -= 1
   }
}

function moveTetrominoLeft() {
   tetromino.column -= 1;
   if (isValid()) {
      tetromino.column += 1
   }
}

function generatePlayfield() {
   document.querySelector('.tetris').innerHTML = '';
   for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
      const div = document.createElement('div');
      document.querySelector('.tetris').append(div);
   }

   playField = new Array(PLAYFIELD_ROWS)
      .fill()
      .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
   // console.log(playField);
}

function generateTetromino() {
   const nameTetro = getRandomElement(TETROMINO_NAMES);
   const matrixTetro = TETROMINOES[nameTetro];

   const rowTetro = 0;
   const columnTetro = Math.floor(PLAYFIELD_COLUMNS / 2 - matrixTetro.length / 2);

   tetromino = {
      name: nameTetro,
      matrix: matrixTetro,
      row: rowTetro,
      column: columnTetro,
   }
}

function drawPlayField() {

   for (let row = 0; row < PLAYFIELD_ROWS; row++) {
      for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
         const name = playField[row][column];
         const cellIndex = convertPositionToIndex(row, column);
         cells[cellIndex].classList.add(name);
      }
   }
}

function drawTetromino() {
   const name = tetromino.name;
   const tetrominoMatrixSize = tetromino.matrix.length;

   for (let row = 0; row < tetrominoMatrixSize; row++) {
      for (let column = 0; column < tetrominoMatrixSize; column++) {
         if (isOutsideTopBoard(row)) { continue }
         if (tetromino.matrix[row][column] == 0) { continue }

         const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
         cells[cellIndex].classList.add(name);
      }
   }
}

function draw() {
   cells.forEach(function (cell) {
      cell.removeAttribute('class')
   });
   drawPlayField();
   drawTetromino();
}
function countScore(destroyRows) {
   switch (destroyRows) {
      case 1:
         score += 10;
         break;
      case 2:
         score += 30;
         break;
      case 3:
         score += 50;
         break;
      case 4:
         score += 100;
         break;
      default:
         score += 0;
   }
   document.querySelector('.score').innerHTML = score;
}

function gameOver() {
   stopLoop();
   gameOverBlock.style.display = 'flex';
}

function getRandomElement(array) {
   const randomIndex = Math.floor(Math.random() * array.length);
   return array[randomIndex];
}

function convertPositionToIndex(row, column) {
   return row * PLAYFIELD_COLUMNS + column;
}

function isOutsideTopBoard(row) {
   return tetromino.row + row < 0;
}

function placeTetromino() {
   const matrixSize = tetromino.matrix.length;
   for (let row = 0; row < matrixSize; row++) {
      for (let column = 0; column < matrixSize; column++) {
         if (!tetromino.matrix[row][column]) continue;
         if (isOutsideTopBoard(row)) {
            isGameOver = true;
            return;
         }
         playField[tetromino.row + row][tetromino.column + column] = tetromino.name;
      }
   }
   const filledRows = findFilledRows();
   // console.log(filledRows);
   removeFillRows(filledRows);
   generateTetromino();
}

function removeFillRows(filledRows) {
   // filledRows.forEach(row => {
   //     dropRowsAbove(row);
   // })

   for (let i = 0; i < filledRows.length; i++) {
      const row = filledRows[i];
      dropRowsAbove(row);
   }
   countScore(filledRows.length);
}

function dropRowsAbove(rowDelete) {
   for (let row = rowDelete; row > 0; row--) {
      playField[row] = playField[row - 1];
   }

   playField[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows() {
   const filledRows = [];
   for (let row = 0; row < PLAYFIELD_ROWS; row++) {
      let filledColumns = 0;
      for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
         if (playField[row][column] != 0) {
            filledColumns++;
         }
      }
      if (PLAYFIELD_COLUMNS == filledColumns) {
         filledRows.push(row);
      }
   }
   return filledRows;
}
function moveDown() {
   moveTetrominoDown();
   draw();
   stopLoop();
   startLoop();
   if (isGameOver) {
      gameOver();
   }
}

function startLoop() {
   timeoutId = setTimeout(
      () => (requestId = requestAnimationFrame(moveDown)),
      700
   );
}

function stopLoop() {
   cancelAnimationFrame(requestId);
   timeoutId = clearTimeout(timeoutId);
}

function rotateTetromino() {
   const oldMatrix = tetromino.matrix;
   const rotatedMatrix = rotateMatrix(tetromino.matrix);
   // array = rotateMatrix(array);
   tetromino.matrix = rotatedMatrix;
   if (isValid()) {
      tetromino.matrix = oldMatrix;
   }
}

function rotateMatrix(matrixTetromino) {
   const N = matrixTetromino.length;
   const rotateMatrix = [];
   for (let i = 0; i < N; i++) {
      rotateMatrix[i] = [];
      for (let j = 0; j < N; j++) {
         rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
      }
   }
   return rotateMatrix;
}

function isValid() {
   const matrixSize = tetromino.matrix.length;
   for (let row = 0; row < matrixSize; row++) {
      for (let column = 0; column < matrixSize; column++) {
         if (!tetromino.matrix[row][column]) { continue; }

         if (isOutsideOfGameBoard(row, column)) { return true }
         if (hasCollisions(row, column)) { return true }
      }
   }
   return false;
}

function isOutsideOfGameBoard(row, column) {
   return tetromino.column + column < 0 ||
      tetromino.column + column >= PLAYFIELD_COLUMNS ||
      tetromino.row + row >= playField.length
}

function hasCollisions(row, column) {
   return playField[tetromino.row + row][tetromino.column + column]
}

