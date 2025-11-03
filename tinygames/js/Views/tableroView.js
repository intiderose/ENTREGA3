class TableroView {
    constructor(canvas, tableroModel, fichaImageUrl) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tablero = tableroModel;

        // Configuramos offsets en el modelo y generamos fichas iniciales
        this.tablero.actualizarCanvasSize(this.canvas.width, this.canvas.height);

        this.animacionHints = 0;

        // Crear la vista para las fichas, pasando la URL de la imagen
        this.fichaView = new FichaView(this.ctx, fichaImageUrl);

        // ========================================
        // 🖼️ IMAGEN DE FONDO DEL TABLERO
        // ========================================
        this.imagenFondo = new Image();
        this.imagenFondoCargada = false;
        this.patternFondo = null; // Para la opción de 'repetir'

        this.imagenFondo.onload = () => {
            this.imagenFondoCargada = true;
            // Creamos el patrón una vez que la imagen ha cargado
            this.patternFondo = this.ctx.createPattern(this.imagenFondo, 'repeat');
            console.log('Imagen de fondo del tablero cargada.');
        };

        // ⬇️ PEGA AQUÍ LA URL DE LA IMAGEN DE FONDO ⬇️
        // Ejemplo: 'https://www.transparenttextures.com/patterns/wood-plank.png'
        this.imagenFondo.src = 'assets/sprinfiled.png';

        // El bucle de render ahora es controlado desde fuera
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

        // 1. Dibujar el fondo del tablero (imagen o color de respaldo)
        this.dibujarFondo();

        // 2. Dibujar las casillas
        for (let fila = 0; fila < this.tablero.filas; fila++) {
            for (let col = 0; col < this.tablero.columnas; col++) {
                if (this.tablero.matriz[fila][col] !== -1) {
                    this.dibujarCasilla(fila, col);
                }
            }
        }

        // 3. Dibujar los hints (si hay)
        if (this.tablero.movimientosValidos && this.tablero.movimientosValidos.length > 0) {
            this.dibujarHints();
        }

        // 4. Dibujar las fichas
        for (let i = 0; i < this.tablero.fichas.length; i++) {
            this.fichaView.dibujar(this.tablero.fichas[i]);
        }
    }

    /**
     * Dibuja la imagen de fondo en el canvas.
     * La imagen se escala para cubrir todo el área del canvas manteniendo su relación de aspecto (como background-size: cover).
     * Esto evita que la imagen se deforme.
     */
    dibujarFondo() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        if (this.imagenFondoCargada && this.imagenFondo.width > 0) {
            // Calcula la escala necesaria para que la imagen cubra el canvas sin deformarse.
            // Se elige la escala mayor para asegurar que tanto el ancho como el alto cubran el canvas.
            const escala = Math.max(
                canvas.width / this.imagenFondo.width,
                canvas.height / this.imagenFondo.height
            );

            const nuevoAncho = this.imagenFondo.width * escala;
            const nuevoAlto = this.imagenFondo.height * escala;

            // Centra la imagen en el canvas. Las partes que sobren quedarán fuera (recortadas).
            const x = (canvas.width - nuevoAncho) / 2;
            const y = (canvas.height - nuevoAlto) / 2;

            // Dibuja la imagen con las nuevas dimensiones y posición.
            ctx.drawImage(this.imagenFondo, x, y, nuevoAncho, nuevoAlto);

        } else {
            // Color de respaldo mientras la imagen carga o si falla la carga.
            ctx.fillStyle = '#2c1810';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
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

            this.ctx.fillStyle = 'rgba(60, 179, 113, 0.8)'; // Verde éxito
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

            this.ctx.strokeStyle = '#2E8B57'; // Verde mar oscuro
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.restore();

            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.tablero.radioFicha * escala, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(60, 179, 113, 0.6)'; // Verde éxito con transparencia
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }
}
