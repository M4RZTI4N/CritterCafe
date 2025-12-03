// Get the image and its map
const image = document.getElementById('homepage_img');
const imageMap = document.getElementById('homepage_map');
const areas = imageMap.querySelectorAll('area');

// Store original image dimensions and area coordinates
let originalImageWidth;
let originalImageHeight;
const originalAreaCoords = [];

function initializeImageMap() {
    originalImageWidth = image.naturalWidth;
    originalImageHeight = image.naturalHeight;

    areas.forEach(area => {
        originalAreaCoords.push(area.coords.split(',').map(Number));
    });
}

// Function to scale the image map
function scaleImageMap() {
    const currentImageWidth = image.offsetWidth;
    const currentImageHeight = image.offsetHeight;

    const scaleX = currentImageWidth / originalImageWidth;
    const scaleY = currentImageHeight / originalImageHeight;

    areas.forEach((area, index) => {
        const originalCoords = originalAreaCoords[index];
        const newCoords = originalCoords.map((coord, i) => {
            return (i % 2 === 0) ? Math.round(coord * scaleX) : Math.round(coord * scaleY);
        });
        area.coords = newCoords.join(',');
    });
}

// Initialize when the image loads
image.onload = initializeImageMap;

// Observe image resizing
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        if (entry.target === image) {
            scaleImageMap();
        }
    }
});

resizeObserver.observe(image);