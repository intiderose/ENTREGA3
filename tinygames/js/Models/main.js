window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('No se encontró el canvas del juego');
        return;
    }

    let gameState = 'MENU'; // 'MENU', 'PLAYING'
    let juegoController = null;
    let menuController = null;
    let lastSelectedItem = null; // Guardar la selección de ficha

    function startGame(selectedItem) {
        lastSelectedItem = selectedItem; // Guardar la ficha seleccionada
        const tablero = new Tablero();
        const gameView = new GameView();
        const homeroImageUrl = 'assets/fichaHomero.png'; // Siempre presente
        const tableroView = new TableroView(canvas, tablero, selectedItem.src, homeroImageUrl, selectedItem.backgroundSrc);

        juegoController = new JuegoController(tablero, tableroView, gameView);
        juegoController.iniciarTimer(); // El timer empieza solo cuando el juego comienza

        gameState = 'PLAYING';
    }

    // NUEVO: reiniciar el juego desde cero, manteniendo la ficha seleccionada
    function restartGame() {
        if (!lastSelectedItem) return; // No hay ficha seleccionada, no hacer nada
        if (juegoController) {
            // Ocultar el popup de game over antes de reiniciar (MVC: usar GameView)
            juegoController.gameView.ocultarGameOver();
            juegoController.destroy();
            juegoController = null;
        }
        // Volver a crear el juego con la última ficha seleccionada
        startGame(lastSelectedItem);
    }

    // Modificado: aceptar estado inicial opcional ('START' o 'CHAR_SELECT')
    function initMenu(initialState) {
        const menuModel = new MenuModel();
        const menuView = new MenuView(canvas, menuModel);
        menuController = new MenuController(canvas, menuModel, menuView, (selectedItem) => {
            startGame(selectedItem);
        }, initialState);
        menuController.init();
    }

    function mainLoop() {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mostrar/ocultar .game-info según gameState
        const gameInfoEl = document.querySelector('.game-info');
        if (gameInfoEl) {
            gameInfoEl.style.display = (gameState === 'PLAYING') ? 'flex' : 'none';
        }

        if (gameState === 'MENU') {
            if (menuController) {
                menuController.view.draw();
            }
        } else if (gameState === 'PLAYING' && juegoController) {
            juegoController.vista.dibujar();
        }

        requestAnimationFrame(mainLoop);
    }

    // Cambiar: los botones de reinicio ahora reinician el juego desde cero, sin volver al menú
    document.getElementById('btn-reiniciar').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        restartGame();
    });
    document.getElementById('btn-reiniciar-gameover').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        restartGame();
    });

    // NUEVO: función para "Volver al Menú" con los requisitos solicitados
    function returnToMenu(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();

        // Detener y destruir el juego actual si existe (limpia timer y listeners)
        if (juegoController) {
            juegoController.gameView.ocultarGameOver();
            juegoController.destroy();
            juegoController = null;
        }

        // Limpiar el canvas visual
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Resetear UI: fichas a 32 y timer a 00:00
        const gameView = new GameView();
        gameView.actualizarFichasCount(32);
        gameView.actualizarTimer(0); // muestra 00:00

        // Ir al menú (estado MENU) y abrir directamente el selector de fichas
        gameState = 'MENU';
        initMenu('CHAR_SELECT');
    }

    // Listener para el nuevo botón (si está presente)
    const volverBtn = document.getElementById('btn-volver-menu');
    if (volverBtn) {
        volverBtn.addEventListener('click', returnToMenu);
    }

    initMenu();
    mainLoop();
});
