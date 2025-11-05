class Tablero {
    /**
    nombre: constructor
    Descripción: Inicializa la estructura lógica del tablero (matriz), parámetros de tamaño y storage de fichas.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Define filas/columnas, tamaños, matriz inicial con casillas válidas/inválidas, y arrays para fichas y movimientos.
    */
    constructor() {
        this.filas = 7;
        this.columnas = 7;
        this.tamanoCasilla = 80; // renamed from tamañoCasilla to tamanoCasilla (ASCII-safe)
        this.espaciado = 20;
        this.radioFicha = 30;

        // Offsets del tablero dentro del canvas; la vista debe establecerlos con actualizarCanvasSize
        this.offsetX = 0;
        this.offsetY = 0;

        this.matriz = [
            [-1, -1,  1,  1,  1, -1, -1],
            [-1, -1,  1,  1,  1, -1, -1],
            [ 1,  1,  1,  1,  1,  1,  1],
            [ 1,  1,  1,  0,  1,  1,  1],
            [ 1,  1,  1,  1,  1,  1,  1],
            [-1, -1,  1,  1,  1, -1, -1],
            [-1, -1,  1,  1,  1, -1, -1]
        ];

        this.fichas = [];
        this.movimientosValidos = [];

        // No inicializamos fichas hasta que la vista configure offsets
    }

    /**
    nombre: actualizarCanvasSize
    Descripción: Calcula offsets del tablero según el tamaño del canvas y (re)inicializa fichas.
    Parámetros: canvasWidth (number), canvasHeight (number)
    Retorna: void
    Funcionalidad: Centra el tablero dentro del canvas calculando offsetX/offsetY y llama a inicializarFichas.
    */
    actualizarCanvasSize(canvasWidth, canvasHeight) {
        this.offsetX = (canvasWidth - (this.columnas * this.tamanoCasilla + (this.columnas - 1) * this.espaciado)) / 2;
        this.offsetY = (canvasHeight - (this.filas * this.tamanoCasilla + (this.filas - 1) * this.espaciado)) / 2;
        this.inicializarFichas();
    }

    /**
    nombre: inicializarFichas
    Descripción: Crea instancias de Ficha para cada casilla marcada con 1 en la matriz.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Itera la matriz y para cada valor 1 calcula la posición visual y añade una nueva Ficha al array.
    */
    inicializarFichas() {
        this.fichas = [];
        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                if (this.matriz[fila][col] === 1) {
                    let pos = this.obtenerPosicionCasilla(fila, col);
                    let ficha = new Ficha(fila, col, pos.x, pos.y, this.radioFicha);
                    this.fichas.push(ficha);
                }
            }
        }
    }

    /**
    nombre: obtenerPosicionCasilla
    Descripción: Devuelve coordenadas x,y del centro de una casilla dada por fila/columna.
    Parámetros: fila (number), columna (number)
    Retorna: {x:number, y:number}
    Funcionalidad: Usa offsetX/offsetY, tamanoCasilla y espaciado para calcular el centro de la casilla.
    */
    obtenerPosicionCasilla(fila, columna) {
        let x = this.offsetX + columna * (this.tamanoCasilla + this.espaciado) + this.tamanoCasilla / 2;
        let y = this.offsetY + fila * (this.tamanoCasilla + this.espaciado) + this.tamanoCasilla / 2;
        return { x: x, y: y };
    }

    /**
    nombre: obtenerCasillaMasCercana
    Descripción: Encuentra la casilla válida más cercana a unas coordenadas dadas.
    Parámetros: x (number), y (number)
    Retorna: objeto {fila, columna, x, y} o null si ninguna casilla cercana está dentro del umbral.
    Funcionalidad: Recorre la matriz, calcula distancia euclidiana al centro de cada casilla válida y devuelve la mejor si está dentro de tamanoCasilla.
    */
    obtenerCasillaMasCercana(x, y) {
        let mejorCasilla = null;
        let menorDistancia = Infinity;

        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                if (this.matriz[fila][col] !== -1) {
                    let pos = this.obtenerPosicionCasilla(fila, col);
                    let distancia = Math.sqrt((x - pos.x) * (x - pos.x) + (y - pos.y) * (y - pos.y));

                    if (distancia < menorDistancia) {
                        menorDistancia = distancia;
                        mejorCasilla = { fila: fila, columna: col, x: pos.x, y: pos.y };
                    }
                }
            }
        }

        if (menorDistancia < this.tamanoCasilla) {
            return mejorCasilla;
        }
        return null;
    }

    /**
    nombre: obtenerFichaEnPosicion
    Descripción: Devuelve la ficha cuyo área contiene el punto indicado (priorizando fichas dibujadas encima).
    Parámetros: x (number), y (number)
    Retorna: Ficha | null
    Funcionalidad: Recorre el array de fichas desde el final hasta el inicio y usa contienePunto para determinar intersección.
    */
    obtenerFichaEnPosicion(x, y) {
        for (let i = this.fichas.length - 1; i >= 0; i--) {
            if (this.fichas[i].contienePunto(x, y)) {
                return this.fichas[i];
            }
        }
        return null;
    }

    /**
    nombre: calcularMovimientosValidos
    Descripción: Calcula y almacena en movimientosValidos las posibles jugadas para una ficha dada.
    Parámetros: ficha (Ficha)
    Retorna: void
    Funcionalidad: Para cada dirección (arriba/abajo/izquierda/derecha) evalúa si hay ficha adyacente y casilla destino vacía mediante esMovimientoValido.
    */
    calcularMovimientosValidos(ficha) {
        this.movimientosValidos = [];
        let fila = ficha.fila;
        let col = ficha.columna;

        let direcciones = [
            { df: -1, dc: 0 },
            { df: 1, dc: 0 },
            { df: 0, dc: -1 },
            { df: 0, dc: 1 }
        ];

        for (let i = 0; i < direcciones.length; i++) {
            let dir = direcciones[i];
            let filaAdyacente = fila + dir.df;
            let colAdyacente = col + dir.dc;
            let filaDestino = fila + dir.df * 2;
            let colDestino = col + dir.dc * 2;

            if (this.esMovimientoValido(fila, col, filaAdyacente, colAdyacente, filaDestino, colDestino)) {
                this.movimientosValidos.push({
                    filaAdyacente: filaAdyacente,
                    colAdyacente: colAdyacente,
                    filaDestino: filaDestino,
                    colDestino: colDestino
                });
            }
        }
    }

    /**
    nombre: esMovimientoValido
    Descripción: Comprueba si un desplazamiento desde origen->destino pasando por adyacente es válido según la matriz.
    Parámetros: filaOrigen (number), colOrigen (number), filaAdyacente (number), colAdyacente (number), filaDestino (number), colDestino (number)
    Retorna: boolean
    Funcionalidad: Verifica límites, que la casilla destino sea válida y vacía, y que la casilla adyacente tenga ficha.
    */
    esMovimientoValido(filaOrigen, colOrigen, filaAdyacente, colAdyacente, filaDestino, colDestino) {
        // Comprobaciones de límites
        if (filaAdyacente < 0 || filaAdyacente >= this.filas || colAdyacente < 0 || colAdyacente >= this.columnas) {
            return false;
        }

        if (filaDestino < 0 || filaDestino >= this.filas || colDestino < 0 || colDestino >= this.columnas) {
            return false;
        }

        // Comprobaciones combinadas: la casilla destino debe ser válida y vacía, y la adyacente debe tener ficha
        const destinoValido = this.matriz[filaDestino][colDestino] !== -1;
        const adyacenteTieneFicha = this.matriz[filaAdyacente][colAdyacente] === 1;
        const destinoVacio = this.matriz[filaDestino][colDestino] === 0;

        return destinoValido && adyacenteTieneFicha && destinoVacio;
    }

    /**
    nombre: limpiarMovimientosValidos
    Descripción: Resetea la lista de movimientos válidos y deselecciona todas las fichas.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Vacía movimientosValidos y recorre fichas poniendo seleccionada=false.
    */
    limpiarMovimientosValidos() {
        this.movimientosValidos = [];
        for (let i = 0; i < this.fichas.length; i++) {
            this.fichas[i].seleccionada = false;
        }
    }

    /**
    nombre: realizarMovimiento
    Descripción: Intenta ejecutar un movimiento si coincide con alguno de los movimientos válidos calculados.
    Parámetros: ficha (Ficha), casillaDestino ({fila, columna, x, y})
    Retorna: boolean (true si el movimiento se realizó)
    Funcionalidad: Busca en movimientosValidos una entrada que coincida con casillaDestino; si existe elimina la ficha intermedia, actualiza matriz y mueve la ficha al destino.
    */
    realizarMovimiento(ficha, casillaDestino) {
        for (let i = 0; i < this.movimientosValidos.length; i++) {
            let mov = this.movimientosValidos[i];
            if (mov.filaDestino === casillaDestino.fila && mov.colDestino === casillaDestino.columna) {
                this.eliminarFicha(mov.filaAdyacente, mov.colAdyacente);

                this.matriz[ficha.fila][ficha.columna] = 0;
                this.matriz[casillaDestino.fila][casillaDestino.columna] = 1;

                let pos = this.obtenerPosicionCasilla(casillaDestino.fila, casillaDestino.columna);
                ficha.moverACasilla(casillaDestino.fila, casillaDestino.columna, pos.x, pos.y);

                this.limpiarMovimientosValidos();
                return true;
            }
        }
        return false;
    }

    /**
    nombre: eliminarFicha
    Descripción: Elimina una ficha del array de fichas y marca la casilla en la matriz como vacía.
    Parámetros: fila (number), columna (number)
    Retorna: void
    Funcionalidad: Busca la ficha por fila/columna en el array, la elimina con splice y actualiza la matriz a 0.
    */
    eliminarFicha(fila, columna) {
        for (let i = 0; i < this.fichas.length; i++) {
            if (this.fichas[i].fila === fila && this.fichas[i].columna === columna) {
                this.fichas.splice(i, 1);
                this.matriz[fila][columna] = 0;
                break;
            }
        }
    }

    /**
    nombre: contarFichas
    Descripción: Devuelve el número actual de fichas en el tablero.
    Parámetros: ninguno
    Retorna: number
    Funcionalidad: Simplemente devuelve la longitud del array de fichas.
    */
    contarFichas() {
        return this.fichas.length;
    }

    /**
    nombre: hayMovimientosPosibles
    Descripción: Comprueba si existe al menos un movimiento válido en el tablero.
    Parámetros: ninguno
    Retorna: boolean
    Funcionalidad: Recorre todas las fichas y para cada una prueba las cuatro direcciones usando esMovimientoValido; retorna true al primer movimiento válido encontrado.
    */
    hayMovimientosPosibles() {
        for (let i = 0; i < this.fichas.length; i++) {
            let ficha = this.fichas[i];
            let fila = ficha.fila;
            let col = ficha.columna;

            let direcciones = [
                { df: -1, dc: 0 },
                { df: 1, dc: 0 },
                { df: 0, dc: -1 },
                { df: 0, dc: 1 }
            ];

            for (let j = 0; j < direcciones.length; j++) {
                let dir = direcciones[j];
                let filaAdyacente = fila + dir.df;
                let colAdyacente = col + dir.dc;
                let filaDestino = fila + dir.df * 2;
                let colDestino = col + dir.dc * 2;

                if (this.esMovimientoValido(fila, col, filaAdyacente, colAdyacente, filaDestino, colDestino)) {
                    return true;
                }
            }
        }
        return false;
    }

}
