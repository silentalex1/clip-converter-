document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const uploadContainer = document.getElementById('file-upload-container');
    const processingContainer = document.getElementById('processing-container');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    const conversionSection = document.getElementById('conversion-section');
    const downloadBtn = document.getElementById('download-btn');
    const sliderInput = document.getElementById('slider-input');
    const afterImageContainer = document.getElementById('after-image-container');
    const sliderLine = document.querySelector('.slider-line');
    const sliderHandle = document.querySelector('.slider-handle');
    const beforeImage = document.getElementById('before-image');
    const afterImage = document.getElementById('after-image');
    const canvas = document.getElementById('canvas');
    const comparisonSlider = document.getElementById('comparison-slider');
    const objectRemoverBtn = document.getElementById('object-remover-btn');
    const majesticModeToggle = document.getElementById('majestic-mode-toggle');

    let isObjectRemoverActive = false;
    let currentImage = new Image();

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        uploadContainer.style.display = 'none';
        processingContainer.style.display = 'flex';
        let currentPercent = 0;
        const loadingInterval = setInterval(() => {
            currentPercent++;
            loadingBar.style.width = `${currentPercent}%`;
            loadingPercent.textContent = `${currentPercent}%`;
            if (currentPercent >= 100) {
                clearInterval(loadingInterval);
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    currentImage.src = imageUrl;
                    beforeImage.src = imageUrl;
                    afterImage.src = imageUrl;
                    setTimeout(() => {
                        processingContainer.style.display = 'none';
                        conversionSection.style.display = 'flex';
                        setTimeout(() => conversionSection.style.opacity = '1', 50);
                    }, 500);
                };
                reader.readAsDataURL(file);
            }
        }, 20);
    });
    
    const moveSlider = (value) => {
        if (isObjectRemoverActive) return;
        afterImageContainer.style.width = `${value}%`;
        sliderLine.style.left = `${value}%`;
        sliderHandle.style.left = `${value}%`;
    };

    sliderInput.addEventListener('input', (e) => moveSlider(e.target.value));
    sliderInput.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = comparisonSlider.getBoundingClientRect();
        let value = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        value = Math.max(0, Math.min(100, value));
        sliderInput.value = value;
        moveSlider(value);
    });

    objectRemoverBtn.addEventListener('click', () => {
        isObjectRemoverActive = !isObjectRemoverActive;
        objectRemoverBtn.classList.toggle('active', isObjectRemoverActive);
        comparisonSlider.classList.toggle('slider-disabled', isObjectRemoverActive);
        comparisonSlider.classList.toggle('remover-active', isObjectRemoverActive);
    });

    comparisonSlider.addEventListener('click', (e) => {
        if (!isObjectRemoverActive) return;
        const rect = comparisonSlider.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (currentImage.naturalWidth / rect.width);
        const y = (e.clientY - rect.top) * (currentImage.naturalHeight / rect.height);
        removeObjectAt(x, y);
    });

    majesticModeToggle.addEventListener('change', () => {
        afterImage.classList.toggle('majestic', majesticModeToggle.checked);
    });

    function removeObjectAt(x, y) {
        const brushSize = 30;
        const context = canvas.getContext('2d');
        canvas.width = currentImage.naturalWidth;
        canvas.height = currentImage.naturalHeight;
        context.drawImage(currentImage, 0, 0);
        
        const startX = Math.max(0, x - brushSize / 2);
        const startY = Math.max(0, y - brushSize / 2);
        const endX = Math.min(canvas.width, x + brushSize / 2);
        const endY = Math.min(canvas.height, y + brushSize / 2);
        
        context.clearRect(startX, startY, endX - startX, endY - startY);
        
        const newImageUrl = canvas.toDataURL();
        afterImage.src = newImageUrl;
        currentImage.src = newImageUrl;
    }

    downloadBtn.addEventListener('click', () => {
        if (!currentImage.src || currentImage.src.endsWith('/')) {
            alert("Please select a photo first.");
            return;
        }

        const context = canvas.getContext('2d');
        canvas.width = currentImage.naturalWidth;
        canvas.height = currentImage.naturalHeight;
        
        let filters = 'contrast(110%) saturate(120%) brightness(105%)';
        if (majesticModeToggle.checked) {
            filters = 'contrast(120%) saturate(130%) brightness(105%)';
        }
        context.filter = filters;
        context.drawImage(currentImage, 0, 0);
        
        const link = document.createElement('a');
        link.download = 'enhanced-photo.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});
