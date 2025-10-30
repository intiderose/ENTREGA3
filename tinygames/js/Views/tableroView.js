class TableroView {
    constructor(canvas, tableroModel) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tablero = tableroModel;

        // Configuramos offsets en el modelo y generamos fichas iniciales
        this.tablero.actualizarCanvasSize(this.canvas.width, this.canvas.height);

        this.animacionHints = 0;

        // Iniciar bucle de render
        this.iniciarAnimacion();
    }

    iniciarAnimacion() {
        const loop = () => {
            this.dibujar();
            requestAnimationFrame(loop);
        };
        loop();
    }

    dibujar() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#2c1810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let fila = 0; fila < this.tablero.filas; fila++) {
            for (let col = 0; col < this.tablero.columnas; col++) {
                if (this.tablero.matriz[fila][col] !== -1) {
                    this.dibujarCasilla(fila, col);
                }
            }
        }

        if (this.tablero.movimientosValidos && this.tablero.movimientosValidos.length > 0) {
            this.dibujarHints();
        }

        for (let i = 0; i < this.tablero.fichas.length; i++) {
            this.dibujarFicha(this.tablero.fichas[i]);
        }
    }

    dibujarCasilla(fila, columna) {
        let pos = this.tablero.obtenerPosicionCasilla(fila, columna);

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        this.ctx.fillStyle = '#d2b48c';
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.tablero.radioFicha + 5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#8b7355';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    dibujarHints() {
        this.animacionHints += 0.1;
        let escala = 1 + Math.sin(this.animacionHints) * 0.2;

        for (let i = 0; i < this.tablero.movimientosValidos.length; i++) {
            let mov = this.tablero.movimientosValidos[i];
            let pos = this.tablero.obtenerPosicionCasilla(mov.filaDestino, mov.colDestino);

            this.ctx.save();
            this.ctx.translate(pos.x, pos.y);
            this.ctx.scale(escala, escala);

            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, -20);
            this.ctx.lineTo(-10, -10);
            this.ctx.lineTo(-5, -10);
            this.ctx.lineTo(-5, 0);
            this.ctx.lineTo(5, 0);
            this.ctx.lineTo(5, -10);
            this.ctx.lineTo(10, -10);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.strokeStyle = '#ff8c00';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.restore();

            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.tablero.radioFicha * escala, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }

    dibujarFicha(ficha) {
        const ctx = this.ctx;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = ficha.seleccionada ? 15 : 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.beginPath();
        ctx.arc(ficha.x, ficha.y, ficha.radio, 0, Math.PI * 2);

        let gradiente = ctx.createRadialGradient(
            ficha.x - ficha.radio / 3,
            ficha.y - ficha.radio / 3,
            ficha.radio / 10,
            ficha.x,
            ficha.y,
            ficha.radio
        );

        if (ficha.seleccionada) {
            gradiente.addColorStop(0, '#ffd700');
            gradiente.addColorStop(1, '#ff8c00');
        } else {
            gradiente.addColorStop(0, '#8b4513');
            gradiente.addColorStop(1, '#5c2e0a');
        }

        ctx.fillStyle = gradiente;
        ctx.fill();

        ctx.strokeStyle = ficha.seleccionada ? '#ffd700' : '#3d1f0a';
        ctx.lineWidth = ficha.seleccionada ? 4 : 2;
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(ficha.x, ficha.y, ficha.radio / 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
    }
}

