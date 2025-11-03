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

        // Bind de los manejadores de eventos para poder removerlos después
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
        this.boundResize = this.handleResize.bind(this);

        this.inicializarEventos();
        this.iniciarTimer();
        this.actualizarInterfaz();
    }

    inicializarEventos() {
        this.canvas.addEventListener('mousedown', this.boundMouseDown);
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener('mouseup', this.boundMouseUp);
        window.addEventListener('resize', this.boundResize);
    }

    // Mousedown
    handleMouseDown(e) {
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
    }

    // Mousemove (arrastre + cursor)
    handleMouseMove(e) {
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
    }

    // Mouseup
    handleMouseUp(e) {
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
    }

    // Resize: recalcular offsets y reposicionar fichas
    handleResize() {
        this.tablero.actualizarCanvasSize(this.canvas.width, this.canvas.height);
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

    destroy() {
        // Limpiar intervalo del timer
        clearInterval(this.intervaloTimer);

        // Remover listeners de eventos para que no interfieran con el menú
        this.canvas.removeEventListener('mousedown', this.boundMouseDown);
        this.canvas.removeEventListener('mousemove', this.boundMouseMove);
        this.canvas.removeEventListener('mouseup', this.boundMouseUp);
        window.removeEventListener('resize', this.boundResize);

        // Limpiar cursor
        this.canvas.style.cursor = 'default';

        console.log('JuegoController destruido y listeners limpiados.');
    }
}
