import Tablero from './tablero.js';
class JuegoPeg {
    /**
    nombre: constructor
    Descripción: Inicializa el juego Peg Solitaire (modelo Tablero, estado y bucles de UI).
    Parámetros: canvas (HTMLCanvasElement)
    Retorna: void
    Funcionalidad: Crea el tablero, establece estados de tiempo, registra eventos, inicia timer y animación y actualiza UI inicial.
    */
    constructor(canvas) {
        this.canvas = canvas;
        this.tablero = new Tablero(canvas);
        this.fichaSeleccionada = null;
        this.juegoActivo = true;
        this.tiempoInicio = Date.now();
        this.tiempoTranscurrido = 0;
        this.intervaloTimer = null;

        this.inicializarEventos();
        this.iniciarTimer();
        this.iniciarAnimacion();
        this.actualizarInterfaz();
    }

    /**
    nombre: inicializarEventos
    Descripción: Registra los listeners de mouse necesarios para interacción (mousedown/mousemove/mouseup).
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Añade listeners al canvas; dentro de cada addEventListener se usan callbacks que gestionan selección, arrastre y suelta de fichas.
    */
    inicializarEventos() {
        // mousedown handler: seleccionar/iniciar arrastre
        /**
        nombre: mousedown callback
        Descripción: Maneja la selección de ficha y cálculo de movimientos válidos al presionar el botón del ratón.
        Parámetros: e (MouseEvent)
        Retorna: void
        Funcionalidad: Calcula posición relativa del mouse, obtiene ficha si existe, inicia arrastre centrando la ficha bajo el cursor y solicita movimientos válidos al tablero.
        */
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

                // ===== Cambiado: iniciar arrastre usando el centro de la ficha =====
                const centerX = ficha.x;
                const centerY = ficha.y;
                this.fichaSeleccionada.iniciarArrastre(centerX, centerY);
                // ===================================================================

                this.tablero.calcularMovimientosValidos(ficha);
            } else {
                this.tablero.limpiarMovimientosValidos();
                this.fichaSeleccionada = null;
            }
        });

        // mousemove handler: actualizar arrastre o cursor
        /**
        nombre: mousemove callback (arrastre)
        Descripción: Actualiza la posición de la ficha mientras se arrastra o cambia el cursor si hay ficha bajo el puntero.
        Parámetros: e (MouseEvent)
        Retorna: void
        Funcionalidad: Si hay una ficha en arrastre actualiza su posición según el ratón; si no, determina si debe mostrar cursor 'grab'.
        */
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.juegoActivo) return;

            if (this.fichaSeleccionada && this.fichaSeleccionada.arrastrando) {
                let rect = this.canvas.getBoundingClientRect();
                let mouseX = e.clientX - rect.left;
                let mouseY = e.clientY - rect.top;

                this.fichaSeleccionada.actualizarPosicion(mouseX, mouseY);
                // Cursor indicando arrastre activo
                this.canvas.style.cursor = 'grabbing';
            } else {
                // Cursor dinámico cuando no se está arrastrando
                let rect = this.canvas.getBoundingClientRect();
                let mouseX = e.clientX - rect.left;
                let mouseY = e.clientY - rect.top;
                let ficha = this.tablero.obtenerFichaEnPosicion(mouseX, mouseY);
                this.canvas.style.cursor = ficha ? 'grab' : 'default';
            }
        });

        // mouseup handler: soltar ficha e intentar movimiento
        /**
        nombre: mouseup callback
        Descripción: Intenta completar el movimiento al soltar el botón del ratón; gestiona éxito/fracaso.
        Parámetros: e (MouseEvent)
        Retorna: void
        Funcionalidad: Calcula la casilla más cercana al punto de suelta, pide al tablero realizar movimiento y restaura posición si falló; actualiza interfaz y verifica fin.
        */
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

                // Restaurar cursor al soltar
                this.canvas.style.cursor = 'default';

                this.actualizarInterfaz();
                this.verificarFinDeJuego();
            }
        });

        // cursor dinámico adicional (puede solaparse con mousemove anterior)
        /**
        nombre: mousemove callback (cursor dinámico)
        Descripción: Actualiza el cursor dependiendo de si hay ficha bajo el puntero.
        Parámetros: e (MouseEvent)
        Retorna: void
        Funcionalidad: Recalcula posición del mouse y asigna 'grab' o 'default' según presencia de ficha.
        */
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.juegoActivo) return;

            let rect = this.canvas.getBoundingClientRect();
            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;

            let ficha = this.tablero.obtenerFichaEnPosicion(mouseX, mouseY);
            this.canvas.style.cursor = ficha ? 'grab' : 'default';
        });
    }

    /**
    nombre: iniciarTimer
    Descripción: Inicia el contador que actualiza tiempo transcurrido cada segundo.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Crea un interval que calcula tiempo transcurrido desde tiempoInicio y actualiza el DOM mediante actualizarTimer.
    */
    iniciarTimer() {
        this.intervaloTimer = setInterval(() => {
            if (this.juegoActivo) {
                this.tiempoTranscurrido = Math.floor((Date.now() - this.tiempoInicio) / 1000);
                this.actualizarTimer();
            }
        }, 1000);
    }

    /**
    nombre: actualizarTimer
    Descripción: Formatea y muestra el tiempo transcurrido en formato MM:SS.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Calcula minutos y segundos desde tiempoTranscurrido y actualiza elemento con id 'timer'.
    */
    actualizarTimer() {
        let minutos = Math.floor(this.tiempoTranscurrido / 60);
        let segundos = this.tiempoTranscurrido % 60;

        let timerElemento = document.getElementById('timer');
        if (timerElemento) {
            timerElemento.textContent =
                (minutos < 10 ? '0' : '') + minutos + ':' +
                (segundos < 10 ? '0' : '') + segundos;
        }
    }

    /**
    nombre: actualizarInterfaz
    Descripción: Actualiza el contador de fichas del DOM con el valor del modelo.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Llama a contarFichas y escribe el resultado en el elemento 'fichas-count'.
    */
    actualizarInterfaz() {
        let fichasCount = this.tablero.contarFichas();
        let elementoFichas = document.getElementById('fichas-count');
        if (elementoFichas) {
            elementoFichas.textContent = fichasCount;
        }
    }

    /**
    nombre: verificarFinDeJuego
    Descripción: Verifica si el tablero tiene movimientos disponibles y finaliza si no hay.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Usa hayMovimientosPosibles del modelo; si devuelve false llama a finalizarJuego.
    */
    verificarFinDeJuego() {
        if (!this.tablero.hayMovimientosPosibles()) {
            this.finalizarJuego();
        }
    }

    /**
    nombre: finalizarJuego
    Descripción: Detiene el juego y muestra pantalla de resultado con estadísticas.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Limpia interval, calcula fichas restantes y muestra mensaje de victoria o finalización en el DOM.
    */
    finalizarJuego() {
        this.juegoActivo = false;
        clearInterval(this.intervaloTimer);

        let fichasRestantes = this.tablero.contarFichas();
        let gameOverDiv = document.getElementById('game-over');
        let gameOverTitle = document.getElementById('game-over-title');
        let gameOverMessage = document.getElementById('game-over-message');

        if (fichasRestantes === 1) {
            gameOverTitle.textContent = '🏆 ¡Victoria Perfecta!';
            gameOverMessage.textContent = `¡Increíble! Completaste el juego con solo 1 ficha en ${this.formatearTiempo()}`;
        } else {
            gameOverTitle.textContent = '¡JuegoPeg Terminado!';
            gameOverMessage.textContent = `Quedaron ${fichasRestantes} fichas. Tiempo: ${this.formatearTiempo()}. ¡Intenta de nuevo!`;
        }

        gameOverDiv.classList.remove('hidden');
    }

    /**
    nombre: formatearTiempo
    Descripción: Convierte tiempoTranscurrido a cadena MM:SS.
    Parámetros: ninguno
    Retorna: string
    Funcionalidad: Calcula minutos y segundos y devuelve texto con ceros a la izquierda cuando corresponda.
    */
    formatearTiempo() {
        let minutos = Math.floor(this.tiempoTranscurrido / 60);
        let segundos = this.tiempoTranscurrido % 60;
        return (minutos < 10 ? '0' : '') + minutos + ':' + (segundos < 10 ? '0' : '') + segundos;
    }

    /**
    nombre: reiniciar
    Descripción: Reinicia el estado del juego a su configuración inicial.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Reinicia el tablero, estados de tiempo, reinicia timer y oculta panel de game over.
    */
    reiniciar() {
        this.tablero.reiniciar();
        this.fichaSeleccionada = null;
        this.juegoActivo = true;
        this.tiempoInicio = Date.now();
        this.tiempoTranscurrido = 0;

        clearInterval(this.intervaloTimer);
        this.iniciarTimer();

        this.actualizarInterfaz();

        let gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) {
            gameOverDiv.classList.add('hidden');
        }
    }

    /**
    nombre: iniciarAnimacion
    Descripción: Inicia el bucle de animación que dibuja el tablero continuamente.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Usa requestAnimationFrame para llamar a tablero.dibujar en cada frame.
    */
    iniciarAnimacion() {
        const loop = () => {
            this.tablero.dibujar();
            requestAnimationFrame(loop);
        };
        loop();
    }
}

export default JuegoPeg;
