const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const finalScoreEl = document.getElementById('final-score');

// Load assets
const playerImg = new Image();
playerImg.src = 'player.png';

const bugImg = new Image();
bugImg.src = 'bug.png';

const coffeeImg = new Image();
coffeeImg.src = 'coffee.png';

const backgroundImg = new Image();
backgroundImg.src = 'background.png';

const collectSound = new Audio('collect.mp3');
const hitSound = new Audio('hit.mp3');
const gameOverSound = new Audio('gameover.mp3');

// Game state
let score;
let lives;
let gameOver;
let player;
let items;
let itemSpawnRate;
let itemSpawnTimer;
let gameSpeed;

function init() {
    score = 0;
    lives = 3;
    gameOver = false;
    gameSpeed = 2;
    itemSpawnRate = 1000; // ms
    itemSpawnTimer = itemSpawnRate;

    player = {
        x: canvas.width / 2 - 32,
        y: canvas.height - 80,
        width: 64,
        height: 64,
    };

    items = [];
    
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}


function spawnItem() {
    const type = Math.random() < 0.3 ? 'bug' : 'coffee';
    const size = type === 'bug' ? 40 : 48;
    const item = {
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        type: type,
        speed: gameSpeed + Math.random() * 2,
    };
    items.push(item);
}

function update(deltaTime) {
    if (gameOver) return;

    // Spawn new items
    itemSpawnTimer -= deltaTime;
    if (itemSpawnTimer <= 0) {
        spawnItem();
        itemSpawnTimer = itemSpawnRate;
        // Increase difficulty over time
        gameSpeed += 0.05;
        itemSpawnRate = Math.max(300, itemSpawnRate * 0.995);
    }

    // Update item positions
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed;

        // Collision detection
        if (
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y
        ) {
            if (item.type === 'coffee') {
                score += 10;
                collectSound.currentTime = 0;
                collectSound.play();
            } else {
                lives -= 1;
                hitSound.currentTime = 0;
                hitSound.play();
                if (lives <= 0) {
                    endGame();
                }
            }
            items.splice(i, 1);
            continue;
        }

        // Remove off-screen items
        if (item.y > canvas.height) {
            items.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw items
    items.forEach(item => {
        const img = item.type === 'bug' ? bugImg : coffeeImg;
        ctx.drawImage(img, item.x, item.y, item.width, item.height);
    });

    // Draw UI
    ctx.fillStyle = 'white';
    ctx.font = '24px "Courier New", Courier, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Puntuación: ${score}`, 10, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Vidas: ${lives}`, canvas.width - 10, 30);
}

let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    init();
    gameOver = false;
    startScreen.style.display = 'none';
    lastTime = performance.now();
    gameLoop(lastTime);
}

function endGame() {
    gameOver = true;
    gameOverSound.play();
    finalScoreEl.textContent = score;
    gameOverScreen.style.display = 'flex';
}

// Event Listeners
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.width / 2;
    // Clamp player position within canvas bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initial call to draw something on screen before game starts
window.addEventListener('load', () => {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
});

