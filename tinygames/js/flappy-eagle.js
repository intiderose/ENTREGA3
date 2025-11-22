// Módulo FlappyEagle para encapsular la lógica del juego y evitar la contaminación del scope global.
// Se puede inicializar en cualquier contenedor con FlappyEagle.init(containerElement).

window.FlappyEagle = (() => {
    // Estado interno del módulo, no accesible desde fuera.
    let state = {
        container: null,
        bird: null,
        scoreDisplay: null,
        timerDisplay: null,
        gameOverScreen: null,
        instructions: null,
        resetButton: null,

        birdY: 250,
        birdVelocity: 0,
        gravity: 0.5,
        jumpPower: -10,
        score: 0,
        timeLeft: 60,
        gameRunning: false,
        gameStarted: false,

        pipes: [],
        bonuses: [],
        pipeSpeed: 3,

        gameInterval: null,
        pipeInterval: null,
        bonusInterval: null,
        timerInterval: null,

        containerHeight: 0,
        containerWidth: 0,
    };

    // --- MANEJO DE EVENTOS ---
    // Funciones nombradas para poder añadirlas y quitarlas en destroy().
    const handleKeyDown = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!state.gameStarted) {
                state.instructions.style.display = 'none';
                startGame();
                state.gameStarted = true;
            }
            if (state.gameRunning) {
                jump();
            }
        }
    };

    const handleResize = () => {
        if (!state.container) return;
        const rect = state.container.getBoundingClientRect();
        state.containerWidth = rect.width;
        state.containerHeight = rect.height;
        if (!state.gameStarted) {
            state.birdY = state.containerHeight / 2;
            state.bird.style.top = state.birdY + 'px';
        }
    };

    // --- LÓGICA DEL JUEGO ---
    function startGame() {
        state.gameRunning = true;
        state.score = 0;
        state.timeLeft = 60;
        state.birdY = state.containerHeight / 2;
        state.birdVelocity = 0;
        state.pipes = [];
        state.bonuses = [];

        updateScore();
        updateTimer();

        // Limpiar elementos de partidas anteriores
        state.container.querySelectorAll('.fe-pipe, .fe-bonus, .fe-particle').forEach(el => el.remove());

        // Reiniciar estado visual del pájaro
        state.bird.classList.remove('fe-exploding');
        state.bird.style.transform = 'rotate(0deg)';
        state.gameOverScreen.style.display = 'none';

        // Iniciar intervalos del juego
        state.gameInterval = setInterval(gameLoop, 20);
        state.pipeInterval = setInterval(createPipe, 2000);
        state.bonusInterval = setInterval(createBonus, 3000);
        state.timerInterval = setInterval(updateTime, 1000);
    }

    function jump() {
        state.birdVelocity = state.jumpPower;
    }

    function gameLoop() {
        if (!state.gameRunning) return;

        // Física del pájaro
        state.birdVelocity += state.gravity;
        state.birdY += state.birdVelocity;
        state.bird.style.top = state.birdY + 'px';

        // Rotación del pájaro
        let rotation = Math.min(Math.max(state.birdVelocity * 3, -30), 90);
        state.bird.style.transform = `rotate(${rotation}deg)`;

        // Límites de pantalla
        if (state.birdY < 0) {
            state.birdY = 0;
            state.birdVelocity = 0;
        }
        if (state.birdY > state.containerHeight - 150) { // Ajustado para el suelo
            endGame('¡Tocaste el suelo!');
        }

        // Mover tuberías y chequear colisiones
        moveElements(state.pipes, (pipe) => {
            if (checkCollision(state.bird, pipe.element)) {
                explodeBird();
                endGame('¡Chocaste con una tubería!');
            }
        }, (pipe) => {
            // Solo sumar puntos al pasar la tubería superior
            if (pipe.element.classList.contains('fe-pipe-top')) {
                state.score += 10;
                updateScore();
            }
        });

        // Mover bonus y chequear colisiones
        moveElements(state.bonuses, (bonus) => {
            if (checkCollision(state.bird, bonus.element)) {
                collectBonus(bonus.element);
                bonus.element.remove();
                return true; // Indica que fue removido
            }
            return false;
        });
    }

    function moveElements(elements, onCollision, onRemove) {
        for (let i = elements.length - 1; i >= 0; i--) {
            const item = elements[i];
            let itemLeft = parseInt(item.element.style.left);
            itemLeft -= state.pipeSpeed;
            item.element.style.left = itemLeft + 'px';

            if (itemLeft < -100) {
                if (onRemove) onRemove(item);
                item.element.remove();
                elements.splice(i, 1);
            } else {
                if (onCollision(item)) {
                    elements.splice(i, 1);
                }
            }
        }
    }

    function createPipe() {
        if (!state.gameRunning) return;

        let gap = 200;
        let minHeight = 50;
        let maxHeight = state.containerHeight - gap - 150;
        let topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        let pipeTop = document.createElement('div');
        pipeTop.className = 'fe-pipe fe-pipe-top';
        pipeTop.style.left = state.containerWidth + 'px';
        pipeTop.style.height = topHeight + 'px';
        state.container.appendChild(pipeTop);

        let pipeBottom = document.createElement('div');
        pipeBottom.className = 'fe-pipe fe-pipe-bottom';
        pipeBottom.style.left = state.containerWidth + 'px';
        pipeBottom.style.height = (state.containerHeight - topHeight - gap - 100) + 'px';
        state.container.appendChild(pipeBottom);

        state.pipes.push({ element: pipeTop });
        state.pipes.push({ element: pipeBottom });
    }

    function createBonus() {
        if (!state.gameRunning) return;

        let bonusElement = document.createElement('div');
        bonusElement.className = 'fe-bonus';
        bonusElement.style.left = state.containerWidth + 'px';
        bonusElement.style.top = (Math.random() * (state.containerHeight - 250) + 50) + 'px';
        state.container.appendChild(bonusElement);

        state.bonuses.push({ element: bonusElement });
    }


    function collectBonus(bonusElement) {
        state.score += 50;
        updateScore();
        let rect = bonusElement.getBoundingClientRect();
        let containerRect = state.container.getBoundingClientRect();

        for (let i = 0; i < 8; i++) {
            let particle = document.createElement('div');
            particle.className = 'fe-particle';
            // Posicionar relativo al contenedor del juego
            particle.style.left = (rect.left - containerRect.left + 20) + 'px';
            particle.style.top = (rect.top - containerRect.top + 20) + 'px';
            let angle = (Math.PI * 2 * i) / 8;
            let distance = 50;
            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            state.container.appendChild(particle);
            setTimeout(() => particle.remove(), 500);
        }
    }

    function explodeBird() {
        state.bird.classList.add('fe-exploding');
    }

    function checkCollision(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
    }

    function updateScore() {
        state.scoreDisplay.textContent = 'Puntos: ' + state.score;
    }

    function updateTime() {
        if (!state.gameRunning) return;
        state.timeLeft--;
        updateTimer();
        if (state.timeLeft <= 0) {
            endGame('¡Ganaste! Completaste el tiempo', true);
        }
    }

    function updateTimer() {
        state.timerDisplay.textContent = 'Tiempo: ' + state.timeLeft + 's';
    }

    function endGame(message, won = false) {
        if (!state.gameRunning) return; // Evitar múltiples llamadas
        state.gameRunning = false;
        clearInterval(state.gameInterval);
        clearInterval(state.pipeInterval);
        clearInterval(state.bonusInterval);
        clearInterval(state.timerInterval);

        state.gameOverScreen.querySelector('#fe-final-score').textContent = 'Puntuación Final: ' + state.score;
        state.gameOverScreen.querySelector('#fe-final-time').textContent = message;
        state.gameOverScreen.style.display = 'block';

        const title = state.gameOverScreen.querySelector('h1');
        if (won) {
            title.textContent = '🎉 ¡Victoria! 🎉';
            title.style.color = '#4CAF50';
        } else {
            title.textContent = '💥 Game Over 💥';
            title.style.color = '#f44336';
        }
    }

    function resetGame() {
        state.gameStarted = false;
        state.instructions.style.display = 'block';
        state.gameOverScreen.style.display = 'none';
        state.bird.classList.remove('fe-exploding');
        state.bird.style.transform = 'rotate(0deg)';
        state.container.querySelectorAll('.fe-pipe, .fe-bonus, .fe-particle').forEach(el => el.remove());

        // Resetear variables principales
        state.score = 0;
        state.timeLeft = 60;
        state.birdY = state.containerHeight / 2;
        state.birdVelocity = 0;
        updateScore();
        updateTimer();
        state.bird.style.top = state.birdY + 'px';
    }

    // --- MÉTODOS PÚBLICOS ---
    function init(containerElement) {
        if (!containerElement) {
            console.error("FlappyEagle: El contenedor no fue encontrado.");
            return false;
        }
        state.container = containerElement;

        // Cachear elementos del DOM con los nuevos IDs prefijados
        state.bird = state.container.querySelector('#fe-bird');
        state.scoreDisplay = state.container.querySelector('#fe-score');
        state.timerDisplay = state.container.querySelector('#fe-timer');
        state.gameOverScreen = state.container.querySelector('#fe-game-over');
        state.instructions = state.container.querySelector('#fe-instructions');
        state.resetButton = state.container.querySelector('#fe-reset-button');

        if (!state.bird || !state.resetButton) {
            console.error("FlappyEagle: Elementos del juego no encontrados dentro del contenedor.");
            return false;
        }

        // Configurar tamaño responsive inicial
        handleResize();

        // Añadir listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleResize);
        state.resetButton.addEventListener('click', resetGame);

        return true;
    }

    function destroy() {
        // Detener el juego y limpiar intervalos
        state.gameRunning = false;
        clearInterval(state.gameInterval);
        clearInterval(state.pipeInterval);
        clearInterval(state.bonusInterval);
        clearInterval(state.timerInterval);

        // Limpiar listeners
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', handleResize);

        // Limpiar el contenedor
        if (state.container) {
            state.container.innerHTML = '';
        }

        // Resetear el estado para una posible reinicialización
        Object.keys(state).forEach(key => state[key] = null);
    }

    // Exponer la API pública
    return {
        init,
        destroy
    };
})();
