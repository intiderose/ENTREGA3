window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('No se encontró el canvas del juego');
        return;
    }

    let gameState = 'MENU'; // 'MENU', 'PLAYING'
    let juegoController = null;
    let menuController = null;

    function startGame(fichaImageUrl) {
        const tablero = new Tablero();
        const gameView = new GameView();
        const homeroImageUrl = 'assets/fichaHomero.png'; // Siempre presente
        const tableroView = new TableroView(canvas, tablero, fichaImageUrl, homeroImageUrl);

        juegoController = new JuegoController(tablero, tableroView, gameView);

        gameState = 'PLAYING';
        console.log('JuegoPeg (MVC) iniciado con la ficha: ' + fichaImageUrl);
    }

    function returnToMenu() {
        if (juegoController) {
            juegoController.destroy();
            juegoController = null;
        }
        const gameView = new GameView();
        gameView.ocultarGameOver();

        gameState = 'MENU';
        initMenu(); // Re-inicializa el menú y sus listeners
    }

    function initMenu() {
        const menuModel = new MenuModel();
        const menuView = new MenuView(canvas, menuModel);
        menuController = new MenuController(canvas, menuModel, menuView, (selectedSrc) => {
            startGame(selectedSrc);
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
