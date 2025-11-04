class MenuModel {
    constructor() {
        this.imageSources = {
            homero: 'assets/fichaHomero.png',
            perro: 'assets/fichaPerro.png',
            bart: 'assets/fichaBart.png',
            maggie: 'assets/fichaMaggie.png'
        };
        this.images = {};
        this.menuItems = [];
        this.imagesLoaded = false;
        this.selectedCharacterSrc = null;
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
            this.images[key].src = this.imageSources[key];
        }
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
