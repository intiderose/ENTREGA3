class JuegoController {
    /**
    nombre: constructor
    Descripción: Inicializa el controlador que conecta modelo (tablero) y vistas, gestiona eventos y timer.
    Parámetros: tableroModel (Tablero), tableroView (TableroView), gameView (GameView)
    Retorna: void
    Funcionalidad: Guarda referencias, configura estados iniciales, bind de eventos y registra manejadores; no inicia timer aquí.
    */
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

        // Binds para los botones de reinicio
        this.boundRestartClick = this.handleRestartButton.bind(this);
        this.boundRestartGameOverClick = this.handleRestartButton.bind(this);

        this.inicializarEventos();
        // El timer ya no se inicia aquí, se controla desde main.js
        this.actualizarInterfaz();
    }

    /**
    nombre: inicializarEventos
    Descripción: Registra los listeners de mouse y resize en el canvas y botones de UI.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Añade listeners para mousedown/mousemove/mouseup en canvas y resize en window; enlaza botones de reinicio si existen.
    */
    inicializarEventos() {
        this.canvas.addEventListener('mousedown', this.boundMouseDown);
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener('mouseup', this.boundMouseUp);
        window.addEventListener('resize', this.boundResize);

        // Listeners para los botones de reinicio
        const restartBtn = document.getElementById('btn-reiniciar');
        if (restartBtn) {
            restartBtn.addEventListener('click', this.boundRestartClick);
        }
        const restartGameOverBtn = document.getElementById('btn-reiniciar-gameover');
        if (restartGameOverBtn) {
            restartGameOverBtn.addEventListener('click', this.boundRestartGameOverClick);
        }
    }

    /**
    nombre: handleMouseDown
    Descripción: Maneja el evento mousedown sobre el canvas (selección/inicio de arrastre).
    Parámetros: e (MouseEvent)
    Retorna: void
    Funcionalidad: Calcula posición del cursor relativa al canvas, obtiene ficha en esa posición, gestiona selección inicial y calcula movimientos válidos.
    */
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

            // ===== Cambiado: iniciar arrastre usando el CENTRO de la ficha para que quede bajo el cursor =====
            const centerX = ficha.x;
            const centerY = ficha.y;
            this.fichaSeleccionada.iniciarArrastre(centerX, centerY);
            // =================================================================================================

            this.tablero.calcularMovimientosValidos(ficha);
        } else {
            this.tablero.limpiarMovimientosValidos();
            this.fichaSeleccionada = null;
        }
    }

    /**
    nombre: handleMouseMove
    Descripción: Maneja el evento mousemove (actualiza arrastre o cursor).
    Parámetros: e (MouseEvent)
    Retorna: void
    Funcionalidad: Si hay una ficha en arrastre actualiza su posición; si no, cambia el cursor según si hay ficha bajo el puntero.
    */
    handleMouseMove(e) {
        if (!this.juegoActivo) return;

        let rect = this.canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        if (this.fichaSeleccionada && this.fichaSeleccionada.arrastrando) {
            this.fichaSeleccionada.actualizarPosicion(mouseX, mouseY);
            // Mostrar cursor de arrastre activo
            this.canvas.style.cursor = 'grabbing';
            return;
        }

        // Cursor dinámico cuando no se está arrastrando
        let ficha = this.tablero.obtenerFichaEnPosicion(mouseX, mouseY);
        this.canvas.style.cursor = ficha ? 'grab' : 'default';
    }

    /**
    nombre: handleMouseUp
    Descripción: Maneja el evento mouseup (intentar soltar ficha en casilla destino).
    Parámetros: e (MouseEvent)
    Retorna: void
    Funcionalidad: Si se estaba arrastrando, determina la casilla más cercana, solicita al modelo realizar el movimiento y actualiza la interfaz; restaura posición si fallo.
    */
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

    /**
    nombre: handleResize
    Descripción: Responde al cambio de tamaño de la ventana recalculando offsets del tablero.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Llama al método del modelo que recalcula la posición del tablero según las nuevas dimensiones del canvas.
    */
    handleResize() {
        this.tablero.actualizarCanvasSize(this.canvas.width, this.canvas.height);
    }

    /**
    nombre: iniciarTimer
    Descripción: Inicia el temporizador de cuenta regresiva del juego.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Calcula tiempo fin y crea un interval que decrementa tiempoRestante cada segundo; al agotarse llama a finalizarJuego.
    */
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

    /**
    nombre: actualizarInterfaz
    Descripción: Actualiza elementos de la UI relacionados con el estado del tablero.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Obtiene la cantidad de fichas del modelo y la pasa a la vista para actualizar el contador.
    */
    actualizarInterfaz() {
        let fichasCount = this.tablero.contarFichas();
        this.gameView.actualizarFichasCount(fichasCount);
    }

    /**
    nombre: verificarFinDeJuego
    Descripción: Verifica si no hay movimientos posibles y finaliza el juego si corresponde.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Consulta el modelo para detectar movimientos posibles; llama a finalizarJuego si no hay.
    */
    verificarFinDeJuego() {
        if (!this.tablero.hayMovimientosPosibles()) {
            this.finalizarJuego();
        }
    }

    /**
    nombre: finalizarJuego
    Descripción: Termina la partida, detiene timers, marca juego no activo y muestra pantalla de resultado.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Evita ejecuciones múltiples, limpia interval, calcula estado (victoria/tiempo agotado/fin normal) y delega a gameView para mostrar el panel correspondiente.
    */
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

    /**
    nombre: formatearTiempo
    Descripción: Devuelve una cadena con tiempo en formato MM:SS basado en el tiempo restante o transcurrido.
    Parámetros: ninguno
    Retorna: string (formato "MM:SS")
    Funcionalidad: Calcula minutos y segundos y los concatena con ceros a la izquierda si es necesario.
    */
    formatearTiempo() {
        const tiempoTranscurrido = this.duracionJuego - this.tiempoRestante;
        const tiempoAMostrar = this.duracionJuego - (tiempoTranscurrido > 0 ? tiempoTranscurrido : 0);
        let minutos = Math.floor(tiempoAMostrar / 60);
        let segundos = tiempoAMostrar % 60;
        return (minutos < 10 ? '0' : '') + minutos + ':' + (segundos < 10 ? '0' : '') + segundos;
    }

    /**
    nombre: handleRestartButton
    Descripción: Manejador genérico para el botón de reinicio (previene comportamiento por defecto).
    Parámetros: event (Event)
    Retorna: void
    Funcionalidad: Previene el submit/default y stopPropagation; la lógica de reinicio real se maneja externamente.
    */
    handleRestartButton(event) {
        if (event && event.preventDefault) event.preventDefault();
        if (event && event.stopPropagation) event.stopPropagation();
    }

    /**
    nombre: destroy
    Descripción: Limpia recursos del controlador (timers y listeners) antes de destruir la instancia.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Borra interval, remueve listeners de canvas y window, y normaliza el cursor.
    */
    destroy() {
        // Limpiar intervalo del timer
        clearInterval(this.intervaloTimer);

        // Remover listeners de eventos para que no interfieran con el menú
        this.canvas.removeEventListener('mousedown', this.boundMouseDown);
        this.canvas.removeEventListener('mousemove', this.boundMouseMove);
        this.canvas.removeEventListener('mouseup', this.boundMouseUp);
        window.removeEventListener('resize', this.boundResize);

        this.canvas.style.cursor = 'default';
    }
}
