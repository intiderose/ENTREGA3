class JuegoController {
    constructor(tableroModel, tableroView, gameView) {
        this.tablero = tableroModel;
        this.vista = tableroView;
        this.gameView = gameView;

        this.fichaSeleccionada = null;
        this.juegoActivo = true;
        this.tiempoInicio = Date.now();
        this.tiempoTranscurrido = 0;
        this.intervaloTimer = null;

        this.canvas = this.vista.canvas;

        this.inicializarEventos();
        this.iniciarTimer();
        this.actualizarInterfaz();
    }

    inicializarEventos() {
        // Mousedown
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.juegoActivo) return;

            let rect = this.canvas.getBoundingClientRect();
            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;

            let ficha = this.tablero.obtenerFichaEnPosicion(mouseX, mouseY);

            if (ficha) {
                if (this.fichaSeleccionada && this.fichaSeleccionada !== ficha) {
                    this.fichaSeleccionada.seleccionada = false;
                }

                this.fichaSeleccionada = ficha;
                this.fichaSeleccionada.iniciarArrastre(mouseX, mouseY);
                this.tablero.calcularMovimientosValidos(ficha);
            } else {
                this.tablero.limpiarMovimientosValidos();
                this.fichaSeleccionada = null;
            }
        });

        // Mousemove (arrastre + cursor)
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.juegoActivo) return;

            let rect = this.canvas.getBoundingClientRect();
            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;

            if (this.fichaSeleccionada && this.fichaSeleccionada.arrastrando) {
                this.fichaSeleccionada.actualizarPosicion(mouseX, mouseY);
            }

            // Cursor dinámico
            let ficha = this.tablero.obtenerFichaEnPosicion(mouseX, mouseY);
            this.canvas.style.cursor = ficha ? 'grab' : 'default';
        });

        // Mouseup
        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.juegoActivo) return;

            if (this.fichaSeleccionada && this.fichaSeleccionada.arrastrando) {
                let rect = this.canvas.getBoundingClientRect();
                let mouseX = e.clientX - rect.left;
                let mouseY = e.clientY - rect.top;

                let casillaDestino = this.tablero.obtenerCasillaMasCercana(mouseX, mouseY);

                let movimientoExitoso = false;
                if (casillaDestino) {
                    movimientoExitoso = this.tablero.realizarMovimiento(this.fichaSeleccionada, casillaDestino);
                }

                if (!movimientoExitoso) {
                    this.fichaSeleccionada.volverPosicionInicial();
                    this.tablero.limpiarMovimientosValidos();
                }

                this.fichaSeleccionada.detenerArrastre();
                this.fichaSeleccionada = null;

                this.actualizarInterfaz();
                this.verificarFinDeJuego();
            }
        });

        // Resize: recalcular offsets y reposicionar fichas
        window.addEventListener('resize', () => {
            this.tablero.actualizarCanvasSize(this.canvas.width, this.canvas.height);
        });
    }

    iniciarTimer() {
        this.intervaloTimer = setInterval(() => {
            if (this.juegoActivo) {
                this.tiempoTranscurrido = Math.floor((Date.now() - this.tiempoInicio) / 1000);
                this.gameView.actualizarTimer(this.tiempoTranscurrido);
            }
        }, 1000);
    }

    actualizarInterfaz() {
        let fichasCount = this.tablero.contarFichas();
        this.gameView.actualizarFichasCount(fichasCount);
    }

    verificarFinDeJuego() {
        if (!this.tablero.hayMovimientosPosibles()) {
            this.finalizarJuego();
        }
    }

    finalizarJuego() {
        this.juegoActivo = false;
        clearInterval(this.intervaloTimer);

        let fichasRestantes = this.tablero.contarFichas();

        if (fichasRestantes === 1) {
            this.gameView.mostrarGameOver('🏆 ¡Victoria Perfecta!', `¡Increíble! Completaste el juego con solo 1 ficha en ${this.formatearTiempo()}`);
        } else {
            this.gameView.mostrarGameOver('¡JuegoPeg Terminado!', `Quedaron ${fichasRestantes} fichas. Tiempo: ${this.formatearTiempo()}. ¡Intenta de nuevo!`);
        }
    }

    formatearTiempo() {
        let minutos = Math.floor(this.tiempoTranscurrido / 60);
        let segundos = this.tiempoTranscurrido % 60;
        return (minutos < 10 ? '0' : '') + minutos + ':' + (segundos < 10 ? '0' : '') + segundos;
    }

    reiniciar() {
        this.tablero.reiniciar();
        this.fichaSeleccionada = null;
        this.juegoActivo = true;
        this.tiempoInicio = Date.now();
        this.tiempoTranscurrido = 0;

        clearInterval(this.intervaloTimer);
        this.iniciarTimer();

        this.actualizarInterfaz();
        this.gameView.ocultarGameOver();
    }
}

let juegoController;
window.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('gameCanvas');

    if (canvas) {
        // Cargamos dependencias: modelos, vistas y controlador ya deben estar disponibles en el scope global o importadas
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

