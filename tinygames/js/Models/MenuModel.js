class MenuModel {
    constructor() {
        this.imageSources = {
            homero: 'assets/fichaHomero.png',
            marge: 'assets/fichaPerro.png',
            bart: 'assets/fichaBart.png',
            lisa: 'assets/fichaMaggie.png'
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
        const totalWidth = (itemWidth * 2) + gap;
        const totalHeight = (itemHeight * 2) + gap;
        const startX = (canvasWidth - totalWidth) / 2;
        const startY = (canvasHeight - totalHeight) / 2;

        this.menuItems = [
            { id: 'homero', x: startX, y: startY, width: itemWidth, height: itemHeight, image: this.images.homero, src: this.imageSources.homero },
            { id: 'marge', x: startX + itemWidth + gap, y: startY, width: itemWidth, height: itemHeight, image: this.images.marge, src: this.imageSources.marge },
            { id: 'bart', x: startX, y: startY + itemHeight + gap, width: itemWidth, height: itemHeight, image: this.images.bart, src: this.imageSources.bart },
            { id: 'lisa', x: startX + itemWidth + gap, y: startY + itemHeight + gap, width: itemWidth, height: itemHeight, image: this.images.lisa, src: this.imageSources.lisa }
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

