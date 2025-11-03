class MenuController {
    constructor(canvas, menuModel, menuView, onCharacterSelect) {
        this.canvas = canvas;
        this.model = menuModel;
        this.view = menuView;
        this.onCharacterSelect = onCharacterSelect; // Callback para iniciar el juego

        this.handleMenuClick = this.handleMenuClick.bind(this);
    }

    init() {
        this.model.loadImages(() => {
            this.model.setupMenuItems(this.canvas.width, this.canvas.height);
            this.view.draw(); // Dibuja el menú una vez que las imágenes están listas
        });
        this.addEventListeners();
    }

    addEventListeners() {
        this.canvas.addEventListener('click', this.handleMenuClick);
    }

    removeEventListeners() {
        this.canvas.removeEventListener('click', this.handleMenuClick);
    }

    handleMenuClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const selectedItem = this.model.getItemAt(mouseX, mouseY);

        if (selectedItem) {
            this.model.selectCharacter(selectedItem.src);
            this.removeEventListeners();
            if (this.onCharacterSelect) {
                this.onCharacterSelect(this.model.selectedCharacterSrc);
            }
        }
    }
}

