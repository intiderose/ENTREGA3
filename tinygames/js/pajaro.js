// Variables del juego
    let bird = document.getElementById('bird');
    let gameContainer = document.getElementById('game-container');
    let scoreDisplay = document.getElementById('score');
    let timerDisplay = document.getElementById('timer');
    let gameOverScreen = document.getElementById('game-over');
    let instructions = document.getElementById('instructions');

    let birdY = 250;
    let birdVelocity = 0;
    let gravity = 0.5;
    let jumpPower = -10;
    let score = 0;
    let timeLeft = 60;
    let gameRunning = false;
    let gameStarted = false;

    let pipes = [];
    let bonuses = [];
    let pipeSpeed = 3;
    let gameInterval;
    let pipeInterval;
    let bonusInterval;
    let timerInterval;

    // Iniciar juego
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            e.preventDefault();

            if (!gameStarted) {
                instructions.style.display = 'none';
                startGame();
                gameStarted = true;
            }

            if (gameRunning) {
                jump();
            }
        }
    });

    function startGame() {
        gameRunning = true;
        score = 0;
        timeLeft = 60;
        birdY = 250;
        birdVelocity = 0;
        pipes = [];
        bonuses = [];

        updateScore();
        updateTimer();

        // Limpiar elementos anteriores
        document.querySelectorAll('.pipe, .bonus').forEach(el => el.remove());

        // Intervalos del juego
        gameInterval = setInterval(gameLoop, 20);
        pipeInterval = setInterval(createPipe, 2000);
        bonusInterval = setInterval(createBonus, 3000);
        timerInterval = setInterval(updateTime, 1000);
    }

    function jump() {
        birdVelocity = jumpPower;
        bird.classList.add('flapping');
        setTimeout(() => bird.classList.remove('flapping'), 300);
    }

    function gameLoop() {
        if (!gameRunning) return;

        // Física del pájaro
        birdVelocity += gravity;
        birdY += birdVelocity;
        bird.style.top = birdY + 'px';

        // Rotación del pájaro según velocidad
        let rotation = Math.min(Math.max(birdVelocity * 3, -30), 90);
        bird.style.transform = `rotate(${rotation}deg)`;

        // Límites de pantalla
        if (birdY < 0) {
            birdY = 0;
            birdVelocity = 0;
        }

        if (birdY > window.innerHeight - 150) {
            endGame('¡Tocaste el suelo!');
        }

        // Mover y verificar tuberías
        pipes.forEach((pipe, index) => {
            let pipeLeft = parseInt(pipe.element.style.left);
            pipeLeft -= pipeSpeed;
            pipe.element.style.left = pipeLeft + 'px';

            // Eliminar tuberías fuera de pantalla
            if (pipeLeft < -100) {
                pipe.element.remove();
                pipes.splice(index, 1);
                score += 10;
                updateScore();
            }

            // Colisión con tuberías
            if (checkCollision(bird, pipe.element)) {
                explodeBird();
                endGame('¡Chocaste con una tubería!');
            }
        });

        // Mover y verificar bonus
        bonuses.forEach((bonus, index) => {
            let bonusLeft = parseInt(bonus.element.style.left);
            bonusLeft -= pipeSpeed;
            bonus.element.style.left = bonusLeft + 'px';

            // Eliminar bonus fuera de pantalla
            if (bonusLeft < -50) {
                bonus.element.remove();
                bonuses.splice(index, 1);
            }

            // Colisión con bonus
            if (checkCollision(bird, bonus.element)) {
                collectBonus(bonus.element);
                bonus.element.remove();
                bonuses.splice(index, 1);
                score += 50;
                updateScore();
            }
        });
    }

    function createPipe() {
        if (!gameRunning) return;

        let gap = 200;
        let minHeight = 100;
        let maxHeight = window.innerHeight - gap - 200;
        let topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        // Tubería superior
        let pipeTop = document.createElement('div');
        pipeTop.className = 'pipe pipe-top';
        pipeTop.style.left = window.innerWidth + 'px';
        pipeTop.style.height = topHeight + 'px';
        gameContainer.appendChild(pipeTop);

        // Tubería inferior
        let pipeBottom = document.createElement('div');
        pipeBottom.className = 'pipe pipe-bottom';
        pipeBottom.style.left = window.innerWidth + 'px';
        pipeBottom.style.height = (window.innerHeight - topHeight - gap - 100) + 'px';
        gameContainer.appendChild(pipeBottom);

        pipes.push({ element: pipeTop });
        pipes.push({ element: pipeBottom });
    }

    function createBonus() {
        if (!gameRunning) return;

        let bonusElement = document.createElement('div');
        bonusElement.className = 'bonus';
        bonusElement.innerHTML = '<div class="star"></div>';
        bonusElement.style.left = window.innerWidth + 'px';
        bonusElement.style.top = (Math.random() * (window.innerHeight - 250) + 50) + 'px';
        gameContainer.appendChild(bonusElement);

        bonuses.push({ element: bonusElement });
    }

    function collectBonus(bonusElement) {
        // Crear partículas
        let rect = bonusElement.getBoundingClientRect();
        for (let i = 0; i < 8; i++) {
            let particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = rect.left + 20 + 'px';
            particle.style.top = rect.top + 20 + 'px';

            let angle = (Math.PI * 2 * i) / 8;
            let distance = 50;
            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

            gameContainer.appendChild(particle);
            setTimeout(() => particle.remove(), 500);
        }
    }

    function explodeBird() {
        bird.classList.add('exploding');
    }

    function checkCollision(element1, element2) {
        let rect1 = element1.getBoundingClientRect();
        let rect2 = element2.getBoundingClientRect();

        return !(rect1.right < rect2.left ||
                 rect1.left > rect2.right ||
                 rect1.bottom < rect2.top ||
                 rect1.top > rect2.bottom);
    }

    function updateScore() {
        scoreDisplay.textContent = 'Puntos: ' + score;
    }

    function updateTime() {
        if (!gameRunning) return;

        timeLeft--;
        updateTimer();

        if (timeLeft <= 0) {
            endGame('¡Ganaste! Completaste el tiempo', true);
        }
    }

    function updateTimer() {
        timerDisplay.textContent = 'Tiempo: ' + timeLeft + 's';
    }

    function endGame(message, won = false) {
        gameRunning = false;
        clearInterval(gameInterval);
        clearInterval(pipeInterval);
        clearInterval(bonusInterval);
        clearInterval(timerInterval);

        document.getElementById('final-score').textContent = 'Puntuación Final: ' + score;
        document.getElementById('final-time').textContent = message;
        gameOverScreen.style.display = 'block';

        if (won) {
            gameOverScreen.querySelector('h1').textContent = '🎉 ¡Victoria! 🎉';
            gameOverScreen.querySelector('h1').style.color = '#4CAF50';
        } else {
            gameOverScreen.querySelector('h1').textContent = '💥 Game Over 💥';
            gameOverScreen.querySelector('h1').style.color = '#f44336';
        }
    }

    function resetGame() {
        gameOverScreen.style.display = 'none';
        bird.classList.remove('exploding');
        bird.style.transform = 'rotate(0deg)';
        document.querySelectorAll('.pipe, .bonus, .particle').forEach(el => el.remove());
        startGame();
    }