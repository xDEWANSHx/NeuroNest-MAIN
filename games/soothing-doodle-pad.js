function initializeDoodlePad() {
    const canvas = document.getElementById('doodle-canvas');
    const clearBtn = document.getElementById('clear-doodle-btn');
    const colorInput = document.getElementById('doodle-color');
    const sizeInput = document.getElementById('doodle-size');

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set canvas size dynamically (e.g., 90% of container width, max 500px)
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth * 0.9, 500);
    canvas.width = size;
    canvas.height = size * 0.75; // Aspect ratio 4:3

    function draw(e) {
        if (!isDrawing) return;
        
        // Handle both mouse and touch events
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = colorInput.value;
        ctx.lineWidth = sizeInput.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        [lastX, lastY] = [x, y];
    }

    function startDrawing(e) {
        isDrawing = true;
        
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = canvas.getBoundingClientRect();
        [lastX, lastY] = [clientX - rect.left, clientY - rect.top];
        e.preventDefault(); // Prevent scrolling on touch devices
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events (for mobile/tablet)
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    // Clear button
    clearBtn.addEventListener('click', clearCanvas);
}