class Ficha {
    constructor(fila, columna, x, y, radio) {
        this.fila = fila;
        this.columna = columna;
        this.x = x;
        this.y = y;
        this.xInicial = x;
        this.yInicial = y;
        this.radio = radio;
        this.seleccionada = false;
        this.arrastrando = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    // Comprueba si un punto (p.ej. cursor) está dentro de la ficha
    contienePunto(x, y) {
        let distancia = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
        return distancia <= this.radio;
    }

    iniciarArrastre(mouseX, mouseY) {
        this.arrastrando = true;
        this.seleccionada = true;
        this.offsetX = mouseX - this.x;
        this.offsetY = mouseY - this.y;
    }

    actualizarPosicion(mouseX, mouseY) {
        if (this.arrastrando) {
            this.x = mouseX - this.offsetX;
            this.y = mouseY - this.offsetY;
        }
    }

    detenerArrastre() {
        this.arrastrando = false;
    }

    volverPosicionInicial() {
        this.x = this.xInicial;
        this.y = this.yInicial;
        this.seleccionada = false;
    }

    moverACasilla(fila, columna, x, y) {
        this.fila = fila;
        this.columna = columna;
        this.x = x;
        this.y = y;
        this.xInicial = x;
        this.yInicial = y;
        this.seleccionada = false;
    }
}