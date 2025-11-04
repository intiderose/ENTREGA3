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
}
