let juegoController;
window.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('gameCanvas');

    if (canvas) {
        // Crear modelo y vistas
        const tablero = new Tablero();
        const tableroView = new TableroView(canvas, tablero);
        const gameView = new GameView();
        juegoController = new JuegoController(tablero, tableroView, gameView);

        let btnReiniciar = document.getElementById('btn-reiniciar');
        if (btnReiniciar) {
            btnReiniciar.addEventListener('click', () => {
                juegoController.reiniciar();
            });
        }

        let btnReiniciarGameOver = document.getElementById('btn-reiniciar-gameover');
        if (btnReiniciarGameOver) {
            btnReiniciarGameOver.addEventListener('click', () => {
                juegoController.reiniciar();
            });
        }

        console.log('JuegoPeg (MVC) iniciado correctamente');
    } else {
        console.error('No se encontró el canvas del juego');
    }
});
