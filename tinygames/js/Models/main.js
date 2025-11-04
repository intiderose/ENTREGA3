window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('No se encontró el canvas del juego');
        return;
    }

    let gameState = 'MENU'; // 'MENU', 'PLAYING'
    let juegoController = null;
    let menuController = null;

    function startGame(selectedItem) {
        const tablero = new Tablero();
        const gameView = new GameView();
        const homeroImageUrl = 'assets/fichaHomero.png'; // Siempre presente
        const tableroView = new TableroView(canvas, tablero, selectedItem.src, homeroImageUrl, selectedItem.backgroundSrc);

        juegoController = new JuegoController(tablero, tableroView, gameView);
        juegoController.iniciarTimer(); // El timer empieza solo cuando el juego comienza

        gameState = 'PLAYING';
        console.log('JuegoPeg (MVC) iniciado con la ficha: ' + selectedItem.src);
    }

    function returnToMenu() {
        if (juegoController) {
            juegoController.destroy(); // Esto ya limpia el intervalo del timer
            juegoController = null;
        }
        const gameView = new GameView();
        gameView.ocultarGameOver();

        // Resetear el timer en la UI a 15:00 al volver al menú
        gameView.actualizarTimer(15 * 60);

        // Refactor: Resetear contador de fichas a 32 al volver al menú.
        gameView.actualizarFichasCount(32);

        gameState = 'MENU';
        initMenu(); // Re-inicializa el menú y sus listeners
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

    // Configurar botones de reinicio para que vuelvan al menú
    document.getElementById('btn-reiniciar').addEventListener('click', returnToMenu);
    document.getElementById('btn-reiniciar-gameover').addEventListener('click', returnToMenu);

    initMenu();
    mainLoop();
});
