class MenuModel {
    constructor() {
        this.imageSources = {
            homero: 'assets/fichaHomero.png',
            perro: 'assets/fichaPerro.png',
            bart: 'assets/fichaBart.png',
            maggie: 'assets/fichaMaggie.png',
            background: 'assets/imagenMenu.png',
            miniature: 'assets/pegSolitarieMiniatura.png'
        };
        this.images = {};
        this.menuItems = [];
        this.imagesLoaded = false;
        this.selectedCharacterSrc = null;

        // Nuevo: estado del menú y propiedades del botón Play
        this.menuState = 'START'; // 'START' | 'CHAR_SELECT'
        this.playButton = {
            x: 0,
            y: 0,
            width: 240,
            height: 64,
            color: '#FF6B00',
            text: 'Jugar',
            textColor: '#FFFFFF',
            radius: 12
        };
    }

    loadImages(callback) {
        let loadedCount = 0;
        const totalImages = Object.keys(this.imageSources).length;

        if (totalImages === 0) {
            this.imagesLoaded = true;
            if (callback) callback();
            return;
        }

        for (const key in this.imageSources) {
            this.images[key] = new Image();
            this.images[key].onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.imagesLoaded = true;
                    console.log('Imágenes del menú cargadas.');
                    if (callback) callback();
                }
            };
            // Añadido: Manejo de error para la carga de imágenes
            this.images[key].onerror = () => {
                console.warn(`No se pudo cargar la imagen: ${this.imageSources[key]}`);
                loadedCount++; // Contar como "cargada" para no bloquear el callback
                if (loadedCount === totalImages) {
                    this.imagesLoaded = true;
                    if (callback) callback();
                }
            };
            this.images[key].src = this.imageSources[key];
        }
    }

    /**
     * Calcular posición del botón Play (centrado horizontal, abajo del image display)
     */
    setupPlayButton(canvasWidth, canvasHeight) {
        const btn = this.playButton;
        btn.width = 240;
        btn.height = 64;
        btn.x = Math.round((canvasWidth - btn.width) / 2);
        // Posicionar el botón a 60% de la altura del canvas por defecto
        btn.y = Math.round(canvasHeight * 0.62);
    }

    /**
     * Devuelve true si el punto (x,y) está dentro del botón Play
     */
    isPointInPlayButton(x, y) {
        const b = this.playButton;
        return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
    }

    /**
     * Cambia el estado del menú
     */
    setMenuState(state) {
        this.menuState = state;
    }

    setupMenuItems(canvasWidth, canvasHeight) {
        const itemWidth = 150;
        const itemHeight = 150;
        const gap = 40;
        const numItems = 3; // Ahora son 3 items
        const totalWidth = (itemWidth * numItems) + (gap * (numItems - 1));
        const startX = (canvasWidth - totalWidth) / 2;
        const startY = (canvasHeight - itemHeight) / 2; // Centrado verticalmente

        this.menuItems = [
            // Homero ya no es una opción seleccionable en el menú
            { id: 'perro', x: startX, y: startY, width: itemWidth, height: itemHeight, image: this.images.perro, src: this.imageSources.perro, backgroundSrc: 'assets/sprinfiled.png' },
            { id: 'bart', x: startX + itemWidth + gap, y: startY, width: itemWidth, height: itemHeight, image: this.images.bart, src: this.imageSources.bart, backgroundSrc: 'assets/escuela.png' },
            { id: 'maggie', x: startX + (itemWidth + gap) * 2, y: startY, width: itemWidth, height: itemHeight, image: this.images.maggie, src: this.imageSources.maggie, backgroundSrc: 'assets/casa.png' }
        ];
    }

    getItemAt(x, y) {
        for (let i = 0; i < this.menuItems.length; i++) {
            const item = this.menuItems[i];
            if (x >= item.x && x <= item.x + item.width &&
                y >= item.y && y <= item.y + item.height) {
                return item;
            }
        }
        return null;
    }

    selectCharacter(src) {
        this.selectedCharacterSrc = src;
    }
}
