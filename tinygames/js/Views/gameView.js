class GameView {
    /**
    nombre: constructor
    Descripción: Inicializa la vista de elementos de UI fuera del canvas (timer, contador, game over).
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Constructor sencillo que prepara la instancia para actualizar elementos DOM relacionados con el juego.
    */
    constructor() {}

    /**
    nombre: actualizarTimer
    Descripción: Actualiza el elemento DOM que muestra el temporizador en formato MM:SS.
    Parámetros: segundosRestantes (number)
    Retorna: void
    Funcionalidad: Formatea los segundos a minutos:segundos y actualiza el texto del elemento con id 'timer' si existe.
    */
    actualizarTimer(segundosRestantes) {
        // Asegurarse de que no se muestren números negativos
        const segundos = Math.max(0, segundosRestantes);

        let minutos = Math.floor(segundos / 60);
        let segundosF = segundos % 60;

        let timerElemento = document.getElementById('timer');
        if (timerElemento) {
            timerElemento.textContent =
                (minutos < 10 ? '0' : '') + minutos + ':' +
                (segundosF < 10 ? '0' : '') + segundosF;
        }
    }

    /**
    nombre: actualizarFichasCount
    Descripción: Actualiza el contador de fichas en el DOM.
    Parámetros: cantidad (number)
    Retorna: void
    Funcionalidad: Escribe la cantidad actual de fichas en el elemento con id 'fichas-count' si existe.
    */
    actualizarFichasCount(cantidad) {
        let elementoFichas = document.getElementById('fichas-count');
        if (elementoFichas) {
            elementoFichas.textContent = cantidad;
        }
    }

    /**
    nombre: mostrarGameOver
    Descripción: Muestra el panel de Game Over con título y mensaje.
    Parámetros: titulo (string), mensaje (string)
    Retorna: void
    Funcionalidad: Rellena elementos DOM (title/message) y quita la clase 'hidden' del contenedor para hacerlo visible.
    */
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

    /**
    nombre: ocultarGameOver
    Descripción: Oculta el panel de Game Over.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Añade la clase 'hidden' al contenedor de Game Over para ocultarlo.
    */
    ocultarGameOver() {
        let gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.classList.add('hidden');
        }
    }
}
