class FichaView {
    /**
    nombre: constructor
    Descripción: Inicializa la vista de una ficha y prepara la carga de imágenes.
    Parámetros: ctx (CanvasRenderingContext2D), fichaImageUrl (string)
    Retorna: void
    Funcionalidad: Crea objetos Image para estados normal/seleccionado y lanza la carga mediante inicializarImagenes.
    */
    constructor(ctx, fichaImageUrl) {
        this.ctx = ctx;
        this.imagenesListas = false;

        // Cargar imágenes para las fichas
        this.imgFichaNormal = new Image();
        this.imgFichaSeleccionada = new Image();

        this.inicializarImagenes(fichaImageUrl);
    }

    /**
    nombre: inicializarImagenes
    Descripción: Carga la(s) imagen(es) necesarias para representar la ficha en sus estados.
    Parámetros: fichaImageUrl (string)
    Retorna: void
    Funcionalidad: Asigna onload/onerror, cuenta imágenes cargadas y marca imagenesListas cuando termina; reutiliza la misma imagen para estado seleccionado.
    */
    inicializarImagenes(fichaImageUrl) {
        let cargadas = 0;
        const total = 1; // Solo necesitamos cargar una imagen
        const onImageLoad = () => {
            cargadas++;
            if (cargadas === total) {
                this.imagenesListas = true;
                // Una vez cargada, la asignamos a ambos estados
                this.imgFichaSeleccionada = this.imgFichaNormal;
            }
        };

        this.imgFichaNormal.onload = onImageLoad;

        // La imagen se carga desde la URL proporcionada
        this.imgFichaNormal.src = fichaImageUrl;
    }

    /**
    nombre: dibujar
    Descripción: Dibuja la ficha en el canvas aplicando recorte circular, sombra, borde y brillo.
    Parámetros: ficha (Ficha)
    Retorna: void
    Funcionalidad: Guarda el contexto, aplica shadow, crea clip circular, dibuja la imagen o fallback, restaura contexto y dibuja borde/brillo encima.
    */
    dibujar(ficha) {
        const ctx = this.ctx;

        ctx.save(); // Guardamos el estado del contexto para sombras y recortes

        // Sombra de la ficha
        this.dibujarSombra(ficha.x, ficha.y, ficha.seleccionada);

        // 1. Crear el área de recorte circular en la posición de la ficha
        ctx.beginPath();
        ctx.arc(ficha.x, ficha.y, ficha.radio, 0, Math.PI * 2);
        ctx.clip();

        // 2. Dibujar la imagen DENTRO del círculo recortado
        const imagen = ficha.seleccionada ? this.imgFichaSeleccionada : this.imgFichaNormal;
        if (this.imagenesListas) {
            ctx.drawImage(imagen, ficha.x - ficha.radio, ficha.y - ficha.radio, ficha.radio * 2, ficha.radio * 2);
        } else {
            // Fallback a color sólido si la imagen aún no ha cargado
            ctx.fillStyle = ficha.seleccionada ? '#ff8c00' : '#8b4513';
            ctx.fill();
        }

        ctx.restore(); // Restauramos el contexto para eliminar el recorte y la sombra

        // 3. Dibujar el borde y otros efectos encima (sin recorte)
        this.dibujarBorde(ficha.x, ficha.y, ficha.radio, ficha.seleccionada);
        this.dibujarBrillo(ficha.x, ficha.y, ficha.radio);
    }

    /**
    nombre: dibujarSombra
    Descripción: Configura la sombra del contexto para la ficha.
    Parámetros: x (number), y (number), seleccionada (boolean)
    Retorna: void
    Funcionalidad: Ajusta shadowColor, shadowBlur y offsets según si la ficha está seleccionada.
    */
    dibujarSombra(x, y, seleccionada) {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = seleccionada ? 15 : 10;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
    }

    /**
    nombre: dibujarBorde
    Descripción: Dibuja un borde circular alrededor de la ficha.
    Parámetros: x (number), y (number), radio (number), seleccionada (boolean)
    Retorna: void
    Funcionalidad: Traza un arco con estilo y ancho distinto si la ficha está seleccionada.
    */
    dibujarBorde(x, y, radio, seleccionada) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, radio, 0, Math.PI * 2);
        ctx.strokeStyle = seleccionada ? '#ffd700' : '#3d1f0a';
        ctx.lineWidth = seleccionada ? 4 : 2;
        ctx.stroke();
    }

    /**
    nombre: dibujarBrillo
    Descripción: Superpone un gradiente radial para simular brillo en la ficha.
    Parámetros: x (number), y (number), radio (number)
    Retorna: void
    Funcionalidad: Crea un gradiente radial y lo rellena dentro de un arco circular para dar efecto de luz.
    */
    dibujarBrillo(x, y, radio) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, radio, 0, Math.PI * 2);
        const gradienteBrillo = ctx.createRadialGradient(x - radio * 0.5, y - radio * 0.5, 0, x, y, radio);
        gradienteBrillo.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradienteBrillo.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradienteBrillo;
        ctx.fill();
    }
}
