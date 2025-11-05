class Ficha {
    /**
    nombre: constructor
    Descripción: Inicializa una ficha con su posición lógica y visual y estados de interacción.
    Parámetros: fila (number), columna (number), x (number), y (number), radio (number)
    Retorna: void
    Funcionalidad: Asigna propiedades de posición (fila/columna), coordenadas (x,y), radio y flags para selección/arrastre. Guarda posición inicial para poder restaurarla.
    */
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

    /**
    nombre: contienePunto
    Descripción: Comprueba si un punto (por ejemplo el cursor) está dentro del área circular de la ficha.
    Parámetros: x (number), y (number)
    Retorna: boolean (true si el punto está dentro del radio)
    Funcionalidad: Calcula la distancia euclidiana entre el punto y el centro de la ficha y la compara con el radio.
    */
    contienePunto(x, y) {
        let distancia = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
        return distancia <= this.radio;
    }

    /**
    nombre: iniciarArrastre
    Descripción: Marca la ficha como en arrastre y calcula offsets relativos para un arrastre suave.
    Parámetros: mouseX (number), mouseY (number)
    Retorna: void
    Funcionalidad: Activa flags de arrastre/selección y guarda la diferencia entre la posición del ratón y el centro de la ficha para mantenerla bajo el cursor.
    */
    iniciarArrastre(mouseX, mouseY) {
        this.arrastrando = true;
        this.seleccionada = true;
        this.offsetX = mouseX - this.x;
        this.offsetY = mouseY - this.y;
    }

    /**
    nombre: actualizarPosicion
    Descripción: Actualiza la posición visual de la ficha mientras se arrastra.
    Parámetros: mouseX (number), mouseY (number)
    Retorna: void
    Funcionalidad: Si está en arrastre, coloca la ficha en la posición del ratón compensando el offset calculado al iniciar el arrastre.
    */
    actualizarPosicion(mouseX, mouseY) {
        if (this.arrastrando) {
            this.x = mouseX - this.offsetX;
            this.y = mouseY - this.offsetY;
        }
    }

    /**
    nombre: detenerArrastre
    Descripción: Desactiva el estado de arrastre de la ficha.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Pone la propiedad arrastrando en false para indicar que ya no se mueve con el cursor.
    */
    detenerArrastre() {
        this.arrastrando = false;
    }

    /**
    nombre: volverPosicionInicial
    Descripción: Restaura la ficha a su posición inicial visual y deselecciona.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Reasigna x,y a las coordenadas iniciales guardadas y borra la selección.
    */
    volverPosicionInicial() {
        this.x = this.xInicial;
        this.y = this.yInicial;
        this.seleccionada = false;
    }

    /**
    nombre: moverACasilla
    Descripción: Mueve la ficha a una casilla concreta actualizando fila/columna y posición visual.
    Parámetros: fila (number), columna (number), x (number), y (number)
    Retorna: void
    Funcionalidad: Actualiza la información lógica (fila/columna), las coordenadas visuales y guarda la nueva posición como inicial; deselecciona la ficha.
    */
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