class Tablero {
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

    // La vista debe llamar a este método cuando conozca el tamaño del canvas
    actualizarCanvasSize(canvasWidth, canvasHeight) {
        this.offsetX = (canvasWidth - (this.columnas * this.tamanoCasilla + (this.columnas - 1) * this.espaciado)) / 2;
        this.offsetY = (canvasHeight - (this.filas * this.tamanoCasilla + (this.filas - 1) * this.espaciado)) / 2;
        this.inicializarFichas();
    }

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

    obtenerPosicionCasilla(fila, columna) {
        let x = this.offsetX + columna * (this.tamanoCasilla + this.espaciado) + this.tamanoCasilla / 2;
        let y = this.offsetY + fila * (this.tamanoCasilla + this.espaciado) + this.tamanoCasilla / 2;
        return { x: x, y: y };
    }

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

    obtenerFichaEnPosicion(x, y) {
        for (let i = this.fichas.length - 1; i >= 0; i--) {
            if (this.fichas[i].contienePunto(x, y)) {
                return this.fichas[i];
            }
        }
        return null;
    }

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

    limpiarMovimientosValidos() {
        this.movimientosValidos = [];
        for (let i = 0; i < this.fichas.length; i++) {
            this.fichas[i].seleccionada = false;
        }
    }

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

    eliminarFicha(fila, columna) {
        for (let i = 0; i < this.fichas.length; i++) {
            if (this.fichas[i].fila === fila && this.fichas[i].columna === columna) {
                this.fichas.splice(i, 1);
                this.matriz[fila][columna] = 0;
                break;
            }
        }
    }

    contarFichas() {
        return this.fichas.length;
    }

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
