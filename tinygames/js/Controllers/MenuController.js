class MenuController {
    /**
    nombre: constructor
    Descripción: Controlador del menú que conecta modelo y vista y gestiona la interacción del usuario.
    Parámetros: canvas (HTMLCanvasElement), menuModel (MenuModel), menuView (MenuView), onCharacterSelect (function), initialState (string|undefined)
    Retorna: void
    Funcionalidad: Guarda referencias, callback de selección y estado inicial; hace bind de manejador de click.
    */
    constructor(canvas, menuModel, menuView, onCharacterSelect, initialState) {
        this.canvas = canvas;
        this.model = menuModel;
        this.view = menuView;
        this.onCharacterSelect = onCharacterSelect; // Callback para iniciar el juego
        this.initialState = initialState; // 'START' o 'CHAR_SELECT' opcional

        this.handleMenuClick = this.handleMenuClick.bind(this);
    }

    /**
    nombre: init
    Descripción: Inicializa recursos del menú (carga imágenes y configuración inicial).
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Llama a model.loadImages y según el estado inicial configura el botón Play o los items; añade listeners.
    */
    init() {
        this.model.loadImages(() => {
            // Usar estado inicial si se pasó, sino START
            const state = this.initialState || 'START';
            this.model.setMenuState(state);

            if (state === 'START') {
                this.model.setupPlayButton(this.canvas.width, this.canvas.height);
            } else if (state === 'CHAR_SELECT') {
                this.model.setupMenuItems(this.canvas.width, this.canvas.height);
            }

            this.view.draw(); // solo solicitar renderizado (la vista solo dibuja)
        });
        this.addEventListeners();
    }

    /**
    nombre: addEventListeners
    Descripción: Registra los listeners necesarios para interacción con el menú.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Añade listener de click al canvas que delega a handleMenuClick.
    */
    addEventListeners() {
        this.canvas.addEventListener('click', this.handleMenuClick);
    }

    /**
    nombre: removeEventListeners
    Descripción: Remueve los listeners registrados para evitar fugas al cambiar de pantalla.
    Parámetros: ninguno
    Retorna: void
    Funcionalidad: Elimina el listener de click del canvas.
    */
    removeEventListeners() {
        this.canvas.removeEventListener('click', this.handleMenuClick);
    }

    /**
    nombre: handleMenuClick
    Descripción: Procesa clicks sobre el canvas para navegar en el menú o seleccionar personaje.
    Parámetros: event (MouseEvent)
    Retorna: void
    Funcionalidad: Calcula posición del click y según el estado (START/CHAR_SELECT) detecta clic en botón Play o en un item; al seleccionar personaje invoca el callback onCharacterSelect.
    */
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
