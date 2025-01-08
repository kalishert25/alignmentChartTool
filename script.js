const canvas = document.getElementById('alignment-chart');
const ctx = canvas.getContext('2d');
const deleteButton = document.getElementById("delete-button");
canvas.height = canvas.clientHeight
canvas.width = canvas.clientWidth
let images = [];
let draggingImage = null;
let potentialDeleteImageIdx = null
let offsetX, offsetY;
let imageSize = parseInt(document.getElementById('size-slider').value, 10);

// Draw the axes and labels
function drawAxes() {
    const xAxisLabel = document.getElementById('x-axis').value || 'Right';
    const yAxisLabel = document.getElementById('y-axis').value || 'Top';
    const negXAxisLabel = document.getElementById('-x-axis').value || 'Left';
    const negYAxisLabel = document.getElementById('-y-axis').value || 'Bottom';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawArrow(0, canvas.height / 2, canvas.width, canvas.height / 2, 10)
    drawArrow(canvas.width / 2, 0, canvas.width / 2, canvas.height, 10)


    // Draw images
    for (const img of images) {
        // const size = Math.min(img.image.width, img.image.height);
        // const sx = (img.image.width - size) / 2;
        // const sy = (img.image.height - size) / 2;
        ctx.drawImage(img.image, 0, 0, img.image.width, img.image.height, img.x, img.y, imageSize, imageSize);
    }

    // Add labels
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '20px Inter';


    ctx.textBaseline = "bottom";
    ctx.textAlign = "right";
    ctx.fillText(xAxisLabel, canvas.width - 20, canvas.height / 2 - 10);
    ctx.textAlign = "left";
    ctx.fillText(negXAxisLabel, 20, canvas.height / 2 - 10);

    ctx.textBaseline = "top";
    ctx.fillText(yAxisLabel, canvas.width / 2 + 10, 20);
    ctx.textBaseline = "bottom";
    ctx.fillText(negYAxisLabel, canvas.width / 2 + 10, canvas.height - 20);
}

function drawArrow(x1, y1, x2, y2, headSize) {
    // Calculate the angle of the arrow
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);

    // Calculate the length of the arrow
    const size = Math.sqrt(dx * dx + dy * dy);

    // Save the current state of the canvas
    ctx.save();

    // Translate to the starting point and rotate the canvas to the arrow's direction
    ctx.translate(x1, y1);
    ctx.rotate(angle);

    // Draw the arrow body
    ctx.beginPath();
    ctx.moveTo(headSize, 0); // Start at the base of the arrow
    ctx.lineTo(size - headSize, 0); // Draw the shaft
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw the arrowhead at the end
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(size - headSize, headSize);
    ctx.lineTo(size - headSize, -headSize);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();

    // Draw the arrowhead at the start
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(headSize, headSize);
    ctx.lineTo(headSize, -headSize);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();

    // Restore the canvas state
    ctx.restore();
}

// Automatically update axes labels
document.querySelectorAll('#axis-controls input').forEach(input => {
    input.addEventListener('input', drawAxes);
});

// Handle image upload
document.getElementById('image-upload').addEventListener('change', (event) => {
    for (const file of event.target.files) {
        if (!file) continue

        const img = new Image();
        img.onload = () => {
            images.push({ image: img, x: canvas.width / 2 - imageSize / 2, y: canvas.height / 2 - imageSize / 2 });
            drawAxes();
        };
        img.src = URL.createObjectURL(file);

    }
});

document.getElementById('upload-button').addEventListener('click', () => {
    document.getElementById('image-upload').click();
});

// Handle size slider change
document.getElementById('size-slider').addEventListener('input', (event) => {
    imageSize = parseInt(event.target.value, 10);
    for (const img of images) {
        // nudge images away from the sides of the canvas
        img.x = Math.min(Math.max(img.x, 0), canvas.width - imageSize);
        img.y = Math.min(Math.max(img.y, 0), canvas.height - imageSize);
    }
    drawAxes();
});

// Drag and drop functionality
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    deleteButton.style.display = "";
    // we loop over in reverse order to ensure that images drawn on top are dragged rather than images drawn under them
    for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i]
        if (
            x >= img.x &&
            x <= img.x + imageSize &&
            y >= img.y &&
            y <= img.y + imageSize
        ) {
            draggingImage = img;
            offsetX = x - img.x;
            offsetY = y - img.y;
            return;
        }
    }

});
canvas.addEventListener('contextmenu', (event) => {

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // we loop over in reverse order to ensure that images drawn on top are deleted 
    // rather than images drawn under them

    for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i]
        if (
            x >= img.x &&
            x <= img.x + imageSize &&
            y >= img.y &&
            y <= img.y + imageSize
        ) {


            event.preventDefault()

            deleteButton.style.display = "block";
            deleteButton.style.left = (event.pageX - 10) + "px";
            deleteButton.style.top = (event.pageY - 10) + "px";
            potentialDeleteImageIdx = i
            return;
        }
    }
});

document.addEventListener('mousemove', (event) => {
    if (draggingImage) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        draggingImage.x = Math.min(Math.max(x - offsetX, 0), canvas.width - imageSize);
        draggingImage.y = Math.min(Math.max(y - offsetY, 0), canvas.height - imageSize);
        drawAxes();
    }
});

document.addEventListener('mouseup', () => {
    draggingImage = null;
});

// Download canvas as image
function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'alignment-chart.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Clear all images
function clearImages() {
    images = [];
    drawAxes();
}

function deleteImage() {
    //swap and pop
    images[potentialDeleteImageIdx] = images[images.length - 1]
    images.pop()
    drawAxes()
    deleteButton.style.display = "";

}

// Initialize
window.onload = drawAxes;