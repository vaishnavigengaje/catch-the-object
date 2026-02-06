// -------------------
// Canvas & DOM
// -------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const scoreSpan = document.getElementById("score");
const missSpan = document.getElementById("miss");

// -------------------
// Game Images
// -------------------
const bgImage = new Image();
bgImage.src = "images/wood.png";

const basketImg = new Image();
basketImg.src = "images/basket (2).png";

const objectImage = new Image();
objectImage.src = "images/APPLE (2).png";

// -------------------
// Sound Effects
// -------------------
const catchSound = new Audio("images/catching sound.wav");
const missSound = new Audio("images/miss.wav");
const gameOverSound = new Audio("images/over.wav");

catchSound.volume = 0.7;
missSound.volume = 0.7;
gameOverSound.volume = 0.8;

// -------------------
// Game Variables
// -------------------
let basket = { x: 250, y: 350, width: 100, height: 40 };
let basketSpeed = 10;

let objects = [];
let objectSpeed = 1;
let score = 0;
let missed = 0;
let gameInterval;
let level = 1;

// -------------------
// Controls
// -------------------
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") basket.x -= basketSpeed;
  if (e.key === "ArrowRight") basket.x += basketSpeed;

  if (basket.x < 0) basket.x = 0;
  if (basket.x + basket.width > canvas.width)
    basket.x = canvas.width - basket.width;
});

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  basket.x = e.clientX - rect.left - basket.width / 2;

  if (basket.x < 0) basket.x = 0;
  if (basket.x + basket.width > canvas.width)
    basket.x = canvas.width - basket.width;
});

// -------------------
// Falling Objects
// -------------------
function FallingObject(x, y, size) {
  this.x = x;
  this.y = y;
  this.size = size;
}

function spawnObject() {
  const x = Math.random() * (canvas.width - 20);
  objects.push(new FallingObject(x, 0, 20));
  setTimeout(spawnObject, 3000);
}

// -------------------
// Game Loop
// -------------------
function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(basketImg, basket.x, basket.y, basket.width, basket.height);

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    obj.y += objectSpeed;

    ctx.drawImage(objectImage, obj.x, obj.y, obj.size, obj.size);

    // Catch
    if (
      obj.y + obj.size >= basket.y &&
      obj.x + obj.size >= basket.x &&
      obj.x <= basket.x + basket.width
    ) {
      score++;
      scoreSpan.textContent = "Score: " + score;

      catchSound.currentTime = 0;
      catchSound.play();

      objects.splice(i, 1);
      i--;
    }
    // Miss
    else if (obj.y > canvas.height) {
      missed++;
      missSpan.textContent = "Missed: " + missed;

      missSound.currentTime = 0;
      missSound.play();

      objects.splice(i, 1);
      i--;

      if (missed >= 3) endGame();
    }
  }
}

// -------------------
// Game Control
// -------------------
function startGame() {
  startScreen.style.display = "none";
  canvas.style.display = "block";
  document.getElementById("scoreBoard").style.display = "block";

  score = 0;
  missed = 0;
  objects = [];

  scoreSpan.textContent = "Score: 0";
  missSpan.textContent = "Missed: 0";

  objectSpeed = level;

  // Unlock audio
  [catchSound, missSound, gameOverSound].forEach(sound => {
    sound.play().then(() => sound.pause()).catch(() => {});
  });

  if (bgImage.complete && basketImg.complete && objectImage.complete) {
    gameInterval = setInterval(updateGame, 20);
    spawnObject();
  } else {
    let imagesLoaded = 0;
    const onLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 3) {
        gameInterval = setInterval(updateGame, 20);
        spawnObject();
      }
    };
    bgImage.onload = onLoad;
    basketImg.onload = onLoad;
    objectImage.onload = onLoad;
  }
}

function restartGame() {
  gameOverScreen.style.display = "none";
  level++;
  startGame();
}

function endGame() {
  clearInterval(gameInterval);

  // 🔊 Game Over sound
  gameOverSound.currentTime = 0;
  gameOverSound.play();

  canvas.style.display = "none";
  gameOverScreen.style.display = "block";
  finalScore.textContent = "Your Score: " + score + " | Level: " + level;
}

