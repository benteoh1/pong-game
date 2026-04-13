const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddle = {
    width: 10,
    height: 80,
    x: 15,
    y: canvas.height / 2 - 40,
    dy: 0,
    speed: 6
};

const computer = {
    width: 10,
    height: 80,
    x: canvas.width - 25,
    y: canvas.height / 2 - 40,
    dy: 0,
    speed: 4
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 6,
    dx: 5,
    dy: 5,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;
const WINNING_SCORE = 11;

// Mouse tracking
let mouseY = canvas.height / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Keyboard controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    const netSpacing = 15;
    ctx.strokeStyle = '#00ff88';
    ctx.setLineDash([netSpacing, netSpacing]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameScreen() {
    // Background
    drawRect(0, 0, canvas.width, canvas.height, '#000');

    // Net
    drawNet();

    // Paddles
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, '#00ff88');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#ff006e');

    // Ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffff00');
}

// Update functions
function updatePaddle() {
    // Mouse control
    if (mouseY < paddle.y + paddle.height / 2 && paddle.y > 0) {
        paddle.y -= paddle.speed;
    } else if (mouseY > paddle.y + paddle.height / 2 && paddle.y < canvas.height - paddle.height) {
        paddle.y += paddle.speed;
    }

    // Keyboard control (arrow keys)
    if (keys['ArrowUp'] && paddle.y > 0) {
        paddle.y -= paddle.speed;
    }
    if (keys['ArrowDown'] && paddle.y < canvas.height - paddle.height) {
        paddle.y += paddle.speed;
    }

    // Boundary check
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + paddle.height > canvas.height) paddle.y = canvas.height - paddle.height;
}

function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    // AI follows the ball
    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }

    // Boundary check
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) computer.y = canvas.height - computer.height;
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Clamp ball to stay within bounds
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Paddle collision (player)
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = paddle.x + paddle.width + ball.radius; // Prevent ball from getting stuck
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        ball.dy += hitPos * 3;
    }

    // Paddle collision (computer)
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius; // Prevent ball from getting stuck
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 3;
    }

    // Left wall (computer scores)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }

    // Right wall (player scores)
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;

    // Check for winner
    if (playerScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
        const winner = playerScore >= WINNING_SCORE ? 'YOU WIN!' : 'COMPUTER WINS!';
        setTimeout(() => {
            alert(winner + '\nFinal Score - Player: ' + playerScore + ' | Computer: ' + computerScore);
            playerScore = 0;
            computerScore = 0;
            document.getElementById('playerScore').textContent = playerScore;
            document.getElementById('computerScore').textContent = computerScore;
        }, 500);
    }
}

// Game loop
function gameLoop() {
    updatePaddle();
    updateComputer();
    updateBall();
    drawGameScreen();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
