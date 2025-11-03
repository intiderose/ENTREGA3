window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('No se encontró el canvas del juego');
        return;
    }
    const ctx = canvas.getContext('2d');

    let gameState = 'MENU'; // 'MENU', 'PLAYING'
    let juegoController = null;
    let menuItems = [];
    let images = {};
    let imagesLoaded = 0;
    const imageSources = {
        homero: 'assets/fichaHomero.png',
        marge: 'assets/fichaPerro.png',
        bart: 'assets/fichaBart.png',
        lisa: 'assets/fichaMaggie.png'
    };
    const totalImages = Object.keys(imageSources).length;

    // Cargar imágenes del menú
    for (const key in imageSources) {
        images[key] = new Image();
        images[key].onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                console.log('Imágenes del menú cargadas.');
                setupMenu();
                mainLoop(); // Iniciar el bucle principal solo cuando las imágenes estén listas
            }
        };
        images[key].src = imageSources[key];
    }

    function setupMenu() {
        const itemWidth = 150;
        const itemHeight = 150;
        const gap = 40;
        const totalWidth = (itemWidth * 2) + gap;
        const totalHeight = (itemHeight * 2) + gap;
        const startX = (canvas.width - totalWidth) / 2;
        const startY = (canvas.height - totalHeight) / 2;

        menuItems = [
            { x: startX, y: startY, width: itemWidth, height: itemHeight, image: images.homero, src: imageSources.homero },
            { x: startX + itemWidth + gap, y: startY, width: itemWidth, height: itemHeight, image: images.marge, src: imageSources.marge },
            { x: startX, y: startY + itemHeight + gap, width: itemWidth, height: itemHeight, image: images.bart, src: imageSources.bart },
            { x: startX + itemWidth + gap, y: startY + itemHeight + gap, width: itemWidth, height: itemHeight, image: images.lisa, src: imageSources.lisa }
        ];
    }

    function drawMenu() {
        // Fondo
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Título
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Elige tu Ficha', canvas.width / 2, 150);

        // Dibujar items
        for (let i = 0; i < menuItems.length; i++) {
            const item = menuItems[i];
            ctx.fillStyle = '#d2b48c';
            ctx.fillRect(item.x, item.y, item.width, item.height);
            ctx.drawImage(item.image, item.x, item.y, item.width, item.height);
            ctx.strokeStyle = '#3d1f0a';
            ctx.lineWidth = 4;
            ctx.strokeRect(item.x, item.y, item.width, item.height);
        }
    }

    function iniciarJuego(fichaImageUrl) {
        const tablero = new Tablero();
        const gameView = new GameView();
        const tableroView = new TableroView(canvas, tablero, fichaImageUrl);

        juegoController = new JuegoController(tablero, tableroView, gameView);

        // Configurar botones de reinicio (una sola vez)
        document.getElementById('btn-reiniciar').addEventListener('click', () => juegoController.reiniciar());
        document.getElementById('btn-reiniciar-gameover').addEventListener('click', () => juegoController.reiniciar());

        gameState = 'PLAYING';
        console.log('JuegoPeg (MVC) iniciado con la ficha: ' + fichaImageUrl);
    }

    function handleMenuClick(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        for (let i = 0; i < menuItems.length; i++) {
            const item = menuItems[i];
            if (mouseX >= item.x && mouseX <= item.x + item.width &&
                mouseY >= item.y && mouseY <= item.y + item.height) {

                // Limpiar el listener para que no interfiera con el juego
                canvas.removeEventListener('click', handleMenuClick);
                iniciarJuego(item.src);
                break;
            }
        }
    }

    canvas.addEventListener('click', handleMenuClick);

    function mainLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === 'MENU') {
            drawMenu();
        } else if (gameState === 'PLAYING' && juegoController) {
            juegoController.vista.dibujar();
        }

        requestAnimationFrame(mainLoop);
    }
});
