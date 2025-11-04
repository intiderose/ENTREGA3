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

    function initMenu() {
        const menuModel = new MenuModel();
        const menuView = new MenuView(canvas, menuModel);
        menuController = new MenuController(canvas, menuModel, menuView, (selectedItem) => {
            startGame(selectedItem);
        });
        menuController.init();
    }

    function mainLoop() {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    initMenu();
    mainLoop();
});
