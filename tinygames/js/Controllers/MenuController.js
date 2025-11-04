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
            // Inicialmente mostramos pantalla START y configuramos botón Play
            this.model.setMenuState('START');
            this.model.setupPlayButton(this.canvas.width, this.canvas.height);
            this.view.draw(); // solo solicitar renderizado (la vista solo dibuja)
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

        if (this.model.menuState === 'START') {
            // Si se clickea Play -> cambiar a selección de personajes
            if (this.model.isPointInPlayButton(mouseX, mouseY)) {
                this.model.setMenuState('CHAR_SELECT');
                this.model.setupMenuItems(this.canvas.width, this.canvas.height);
                // No iniciar el juego aquí; la selección de personaje lo hará
                this.view.draw();
            }
            return;
        }

        if (this.model.menuState === 'CHAR_SELECT') {
            const selectedItem = this.model.getItemAt(mouseX, mouseY);
            if (selectedItem) {
                this.model.selectCharacter(selectedItem.src);
                this.removeEventListeners();
                if (this.onCharacterSelect) {
                    this.onCharacterSelect(selectedItem);
                }
            }
        }
    }
}
