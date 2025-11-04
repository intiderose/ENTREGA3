class MenuView {
    constructor(canvas, menuModel) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.model = menuModel;
    }

    draw() {
        // Fondo: Usar imagen si está cargada, sino un color de respaldo
        const backgroundImage = this.model.images.background;
        if (backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
            // Lógica para 'background-size: cover'
            const canvasAspect = this.canvas.width / this.canvas.height;
            const imageAspect = backgroundImage.naturalWidth / backgroundImage.naturalHeight;
            let drawWidth, drawHeight, x, y;

            if (canvasAspect > imageAspect) {
                drawWidth = this.canvas.width;
                drawHeight = this.canvas.width / imageAspect;
                x = 0;
                y = (this.canvas.height - drawHeight) / 2;
            } else {
                drawHeight = this.canvas.height;
                drawWidth = this.canvas.height * imageAspect;
                y = 0;
                x = (this.canvas.width - drawWidth) / 2;
            }
            this.ctx.drawImage(backgroundImage, x, y, drawWidth, drawHeight);
        } else {
            // Color de respaldo si la imagen no carga
            this.ctx.fillStyle = '#E5E7EB'; // Gris claro
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Título con fondo semitransparente para legibilidad
        // Dibujar título solo cuando NO estemos en la pantalla START
        if (this.model.menuState !== 'START') {
            const titleText = 'Elegi tu Ficha';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';

            // Medir el texto para dibujar un fondo que se ajuste
            const textMetrics = this.ctx.measureText(titleText);
            const textWidth = textMetrics.width;
            const textHeight = 48; // Aproximación basada en el tamaño de la fuente
            const padding = 20;
            const boxX = (this.canvas.width - textWidth) / 2 - padding;
            const boxY = 150 - textHeight; // Posicionar la caja detrás del texto
            const boxWidth = textWidth + (padding * 2);
            const boxHeight = textHeight + padding;

            // Dibujar la caja de fondo semitransparente
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 15); // Usar roundRect si está disponible
            this.ctx.fill();

            // Dibujar el texto del título con sombra
            this.ctx.fillStyle = '#ffd700';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            this.ctx.fillText(titleText, this.canvas.width / 2, 150);
        }

        // Resetear sombra para no afectar otros dibujos
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        if (!this.model.imagesLoaded) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Cargando...', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }

        // AÑADIDO: mostrar/ocultar elementos de UI fuera del canvas según el estado del menú.
        // Solo manipula el DOM para renderizado; no modifica el modelo ni maneja eventos.
        try {
            const isStart = this.model.menuState === 'START';

            // Contador de fichas: ocultar toda la caja que lo contiene
            const fichasEl = document.getElementById('fichas-count');
            if (fichasEl && fichasEl.parentElement) {
                fichasEl.parentElement.style.display = isStart ? 'none' : '';
            }

            // Temporizador: ocultar toda la caja que lo contiene
            const timerEl = document.getElementById('timer');
            if (timerEl && timerEl.parentElement) {
                timerEl.parentElement.style.display = isStart ? 'none' : '';
            }

            // Botón reiniciar principal (header)
            const restartBtn = document.getElementById('btn-reiniciar');
            if (restartBtn) restartBtn.style.display = isStart ? 'none' : '';

            // Botón reiniciar en Game Over (si existe)
            const restartGameOverBtn = document.getElementById('btn-reiniciar-gameover');
            if (restartGameOverBtn) restartGameOverBtn.style.display = isStart ? 'none' : '';

            // Si existen otros controles relacionados pueden añadirse aquí de forma similar.
        } catch (e) {
            // No romper el render si el DOM no está disponible por alguna razón.
            console.warn('MenuView: error toggling UI elements visibility', e);
        }

        // Render según estado del modelo: START o CHAR_SELECT
        if (this.model.menuState === 'START') {

            // Dibujar la miniatura como fondo (cover) si está disponible
            const miniImage = this.model.images.miniature;
            if (miniImage && miniImage.complete && miniImage.naturalWidth !== 0) {
                const canvasAspect = this.canvas.width / this.canvas.height;
                const imageAspect = miniImage.naturalWidth / miniImage.naturalHeight;
                let drawWidth, drawHeight, x, y;

                if (canvasAspect > imageAspect) {
                    drawWidth = this.canvas.width;
                    drawHeight = this.canvas.width / imageAspect;
                    x = 0;
                    y = (this.canvas.height - drawHeight) / 2;
                } else {
                    drawHeight = this.canvas.height;
                    drawWidth = this.canvas.height * imageAspect;
                    y = 0;
                    x = (this.canvas.width - drawWidth) / 2;
                }
                this.ctx.drawImage(miniImage, x, y, drawWidth, drawHeight);
            } else {
                // Si no está la miniatura, mantenemos el color de respaldo para evitar lienzo vacío
                this.ctx.fillStyle = '#E5E7EB';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }

            // Dibujar botón Play (solo render)
            const b = this.model.playButton;
            // Botón con borde redondeado
            this.ctx.save();
            this.ctx.fillStyle = b.color;
            this._roundRect(this.ctx, b.x, b.y, b.width, b.height, b.radius);
            this.ctx.fill();

            // Texto del botón
            this.ctx.fillStyle = b.textColor;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(b.text, b.x + b.width / 2, b.y + b.height / 2);
            this.ctx.restore();

            return;
        }

        // Si estamos en CHAR_SELECT -> dibujar los items (código existente)
        // Dibujar items como círculos
        for (let i = 0; i < this.model.menuItems.length; i++) {
            const item = this.model.menuItems[i];
            const centerX = item.x + item.width / 2;
            const centerY = item.y + item.height / 2;
            const radius = item.width / 2;

            this.ctx.save();

            // Sombra para el círculo
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 4;

            // Dibujar el círculo de fondo
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#d2b48c'; // Color de fondo del círculo
            this.ctx.fill();

            // Resetear sombra antes de dibujar la imagen y el borde
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;

            // Crear una máscara circular (clip) para la imagen
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.clip();

            // Dibujar la imagen de la ficha dentro del círculo
            this.ctx.drawImage(item.image, item.x, item.y, item.width, item.height);

            this.ctx.restore(); // Restaurar el contexto para eliminar el clipping

            // Dibujar el borde del círculo encima de todo
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2); // -2 para que el borde esté dentro
            this.ctx.strokeStyle = '#3d1f0a';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        }
    }

    // Helper: dibujar rectángulo con esquinas redondeadas (no muta estado del modelo)
    _roundRect(ctx, x, y, width, height, radius) {
        if (typeof radius === 'number') radius = { tl: radius, tr: radius, br: radius, bl: radius };
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
    }
}
