// Get the image and its map
const image = document.getElementById('homepage_img');
const imageMap = document.getElementById('homepage_map');
const alt_img = document.getElementById("alt_img")
const alt_map = document.getElementById("alt_map")
const areas = imageMap.querySelectorAll('area');
const altAreas =alt_map.querySelectorAll('area')

// Store original image dimensions and area coordinates
let originalImageWidth;
let originalImageHeight;
let altOriginalImageWidth;
let altOriginalImageHeight;
const originalAreaCoords = [];
const altOriginalAreaCoords = [];
function initializeImageMap() {
    originalImageWidth = image.naturalWidth;
    originalImageHeight = image.naturalHeight;
    altOriginalImageWidth = alt_img.naturalWidth;
    altOriginalImageHeight = alt_img.naturalHeight;
    areas.forEach(area => {
        console.log("pushing ", area)
        originalAreaCoords.push(area.coords.split(',').map(Number));
    });
    altAreas.forEach(area => {
        altOriginalAreaCoords.push(area.coords.split(',').map(Number));
    });
}

// Function to scale the image map
function scaleImageMap() {
    const currentImageWidth = image.offsetWidth;
    const currentImageHeight = image.offsetHeight;

    const scaleX = currentImageWidth / originalImageWidth;
    const scaleY = currentImageHeight / originalImageHeight;

    const alt_currentImageWidth = alt_img.offsetWidth;
    const alt_currentImageHeight = alt_img.offsetHeight;

    const alt_scaleX = alt_currentImageWidth / altOriginalImageWidth;
    const alt_scaleY = alt_currentImageHeight / altOriginalImageHeight;

    areas.forEach((area, index) => {
        const originalCoords = originalAreaCoords[index];
        const newCoords = originalCoords.map((coord, i) => {
            return (i % 2 === 0) ? Math.round(coord * scaleX) : Math.round(coord * scaleY);
        });
        area.coords = newCoords.join(',');
    });

    altAreas.forEach((area, index) => {
        const originalCoords = altOriginalAreaCoords[index];
        const newCoords = originalCoords.map((coord, i) => {
            return (i % 2 === 0) ? Math.round(coord * alt_scaleX) : Math.round(coord * alt_scaleY);
        });
        area.coords = newCoords.join(',');
    });
}

// Initialize when the image loads
image.onload = initializeImageMap;
// alt_img.onload = initializeImageMap;
// Observe image resizing
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        if (entry.target === image || entry.target === alt_img) {
            scaleImageMap();
        }
    }
});


window.onload = function (){


    resizeObserver.observe(image);
    resizeObserver.observe(alt_img);
    const orientationMediaQuery = window.matchMedia("(orientation: portrait)");

    if(window.matchMedia("(orientation: portrait)").matches){
        document.getElementById("homepage_container").style.display = "none";
        document.getElementById("alt_container").style.display = "block";
    } else {
        document.getElementById("homepage_container").style.display = "block";
        document.getElementById("alt_container").style.display = "none";
    }
    

    orientationMediaQuery.addEventListener("change", (e) => {
    if (e.matches) {
        console.log("Orientation changed to portrait.");
        document.getElementById("homepage_container").style.display = "none";
        document.getElementById("alt_container").style.display = "block";
    } else {
        console.log("Orientation changed to landscape.");
        document.getElementById("homepage_container").style.display = "block";
        document.getElementById("alt_container").style.display = "none";
    }
    });

}