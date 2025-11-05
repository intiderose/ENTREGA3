/**
nombre: DOMContentLoaded callback
Descripción: Punto de entrada que inicializa canvas, menú y ciclo principal del juego.
Parámetros: ninguno (evento implícito)
Retorna: void
Funcionalidad: Obtiene elementos DOM, define funciones auxiliares (startGame, restartGame, initMenu, mainLoop, returnToMenu), registra botones y lanza el loop principal.
*/
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

    /**
    nombre: startGame
    Descripción: Crea y arranca una nueva partida con la ficha seleccionada.
    Parámetros: selectedItem (object) - información del ítem seleccionado del menú (src, backgroundSrc, etc.)
    Retorna: void
    Funcionalidad: Instancia Tablero, vistas y controlador; inicia el timer del controlador y cambia el estado a PLAYING.
    */
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

    /**
    nombre: restartGame
    Descripción: Reinicia el juego desde cero manteniendo la ficha seleccionada previamente.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Si existe un controlador lo destruye (limpia timers/listeners), y crea uno nuevo usando la última ficha seleccionada.
    */
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

    /**
    nombre: initMenu
    Descripción: Inicializa y muestra el menú principal o selector de personaje.
    Parámetros: initialState (string|undefined) -  'START' o 'CHAR_SELECT'
    Retorna: void
    Funcionalidad: Crea modelo/vista/controlador de menú, configura estado inicial y registra callback de selección de personaje que inicia el juego.
    */
    function initMenu(initialState) {
        const menuModel = new MenuModel();
        const menuView = new MenuView(canvas, menuModel);
        menuController = new MenuController(canvas, menuModel, menuView, (selectedItem) => {
            startGame(selectedItem);
        }, initialState);
        menuController.init();
    }

    /**
    nombre: mainLoop
    Descripción: Bucle principal de render que alterna entre menú y juego según el estado.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Limpia el canvas y delega el dibujo al menuController.view o al controlador del juego; se auto-reinvoca con requestAnimationFrame.
    */
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

    /**
    nombre: returnToMenu
    Descripción: Detiene la partida activa y regresa a la pantalla del menú, abriendo el selector de fichas.
    Parámetros: e (Event)
    Retorna: void
    Funcionalidad: Previene comportamiento por defecto, destruye controlador si existe, limpia canvas y UI externa, establece estado MENU e inicializa menú en modo CHAR_SELECT.
    */
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
