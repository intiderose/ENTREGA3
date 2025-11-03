class GameView {
    constructor() {}

    actualizarTimer(segundosTranscurridos) {
        let minutos = Math.floor(segundosTranscurridos / 60);
        let segundos = segundosTranscurridos % 60;

        let timerElemento = document.getElementById('timer');
        if (timerElemento) {
            timerElemento.textContent =
                (minutos < 10 ? '0' : '') + minutos + ':' +
                (segundos < 10 ? '0' : '') + segundos;
        }
    }

    actualizarFichasCount(cantidad) {
        let elementoFichas = document.getElementById('fichas-count');
        if (elementoFichas) {
            elementoFichas.textContent = cantidad;
        }
    }

    mostrarGameOver(titulo, mensaje) {
        let gameOverDiv = document.getElementById('game-over');
        let gameOverTitle = document.getElementById('game-over-title');
        let gameOverMessage = document.getElementById('game-over-message');

        if (gameOverDiv && gameOverTitle && gameOverMessage) {
            gameOverTitle.textContent = titulo;
            gameOverMessage.textContent = mensaje;
            gameOverDiv.classList.remove('hidden');
        }
    }

    ocultarGameOver() {
        let gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.classList.add('hidden');
        }
    }
}
