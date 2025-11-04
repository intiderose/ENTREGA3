class MenuView {
    constructor(canvas, menuModel) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.model = menuModel;
    }

    draw() {
        // Fondo
        this.ctx.fillStyle =  'red'; //aca poner la imagen de imagenMenu.png
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Título
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Elegi tu Ficha', this.canvas.width / 2, 150);

        if (!this.model.imagesLoaded) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Cargando...', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }

        // Dibujar items
        for (let i = 0; i < this.model.menuItems.length; i++) {
            const item = this.model.menuItems[i];
            this.ctx.fillStyle = '#d2b48c';
            this.ctx.fillRect(item.x, item.y, item.width, item.height);
            this.ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
            this.ctx.strokeStyle = '#3d1f0a';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(item.x, item.y, item.width, item.height);
        }
    }
}

