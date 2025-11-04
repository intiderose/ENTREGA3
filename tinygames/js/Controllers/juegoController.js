class JuegoController {
    constructor(tableroModel, tableroView, gameView) {
        this.tablero = tableroModel;
        this.vista = tableroView;
        this.gameView = gameView;

        this.fichaSeleccionada = null;
        this.juegoActivo = true;

        // Refactor: timer ascendente -> countdown 15:00; al finalizar dispara la misma lógica que 'sin movimientos' (game lost)
        this.duracionJuego = 15 * 60; // 15 minutos en segundos
        this.tiempoRestante = this.duracionJuego;
        this.tiempoFin = null;
        this.intervaloTimer = null;

        this.canvas = this.vista.canvas;

        // Bind de los manejadores de eventos para poder removerlos después
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
        this.boundResize = this.handleResize.bind(this);

        this.inicializarEventos();
        // El timer ya no se inicia aquí, se controla desde main.js
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
        this.tiempoFin = Date.now() + this.tiempoRestante * 1000;
        this.intervaloTimer = setInterval(() => {
            if (this.juegoActivo) {
                const ahora = Date.now();
                this.tiempoRestante = Math.round((this.tiempoFin - ahora) / 1000);

                if (this.tiempoRestante <= 0) {
                    this.tiempoRestante = 0;
                    this.gameView.actualizarTimer(this.tiempoRestante);
                    this.finalizarJuego();
                } else {
                    this.gameView.actualizarTimer(this.tiempoRestante);
                }
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
        if (!this.juegoActivo) return; // Evitar ejecuciones múltiples

        this.juegoActivo = false;
        clearInterval(this.intervaloTimer);

        let fichasRestantes = this.tablero.contarFichas();
        const tiempoAgotado = this.tiempoRestante <= 0;

        if (fichasRestantes === 1) {
            this.gameView.mostrarGameOver('¡Victoria!', `¡Felicitaciones! Completaste el juego en ${this.formatearTiempo()}`);
        } else if (tiempoAgotado) {
            this.gameView.mostrarGameOver('¡Tiempo Agotado!', `Se acabaron los 15 minutos. Te quedaron ${fichasRestantes} fichas.`);
        } else {
            this.gameView.mostrarGameOver('¡Juego Terminado!', `Te quedaron ${fichasRestantes} fichas. Tiempo restante: ${this.formatearTiempo()}`);
        }
    }

    formatearTiempo() {
        const tiempoTranscurrido = this.duracionJuego - this.tiempoRestante;
        const tiempoAMostrar = this.duracionJuego - (tiempoTranscurrido > 0 ? tiempoTranscurrido : 0);
        let minutos = Math.floor(tiempoAMostrar / 60);
        let segundos = tiempoAMostrar % 60;
        return (minutos < 10 ? '0' : '') + minutos + ':' + (segundos < 10 ? '0' : '') + segundos;
    }

    reiniciar() {
        this.tablero.reiniciar();
        this.fichaSeleccionada = null;
        this.juegoActivo = true;

        // Reiniciar temporizador
        this.tiempoRestante = this.duracionJuego;
        this.tiempoFin = Date.now() + this.tiempoRestante * 1000;

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
    }
}
