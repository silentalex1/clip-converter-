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
    const brightnessSlider = document.getElementById('brightness-slider');
    const qualitySelect = document.getElementById('quality-select');

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
        const val = `${value}%`;
        afterImageContainer.style.width = val;
        sliderLine.style.left = val;
        sliderHandle.style.left = val;
    };

    const handleSliderInteraction = (clientX) => {
        const rect = comparisonSlider.getBoundingClientRect();
        let value = ((clientX - rect.left) / rect.width) * 100;
        value = Math.max(0, Math.min(100, value));
        sliderInput.value = value;
        moveSlider(value);
    };

    sliderInput.addEventListener('input', (e) => moveSlider(e.target.value));
    comparisonSlider.addEventListener('mousedown', (e) => {
        handleSliderInteraction(e.clientX);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', () => window.removeEventListener('mousemove', onMouseMove));
    });
    comparisonSlider.addEventListener('touchstart', (e) => {
        handleSliderInteraction(e.touches[0].clientX);
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', () => window.removeEventListener('touchmove', onTouchMove));
    });
    const onMouseMove = (e) => handleSliderInteraction(e.clientX);
    const onTouchMove = (e) => handleSliderInteraction(e.touches[0].clientX);

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
    
    brightnessSlider.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--brightness-filter', `brightness(${e.target.value}%)`);
    });

    function removeObjectAt(x, y) {
        const brushSize = 40;
        const context = canvas.getContext('2d');
        canvas.width = currentImage.naturalWidth;
        canvas.height = currentImage.naturalHeight;
        context.drawImage(currentImage, 0, 0);
        
        context.beginPath();
        context.arc(x, y, brushSize / 2, 0, Math.PI * 2, false);
        context.clip();
        context.clearRect(0, 0, canvas.width, canvas.height);
        
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
        const qualityValue = parseInt(qualitySelect.value, 10);
        const ratio = currentImage.naturalWidth / currentImage.naturalHeight;
        
        canvas.width = (ratio >= 1) ? qualityValue : qualityValue * ratio;
        canvas.height = (ratio < 1) ? qualityValue : qualityValue / ratio;

        let filters = `brightness(${brightnessSlider.value}%) contrast(115%) saturate(120%)`;
        if (majesticModeToggle.checked) {
            filters = `brightness(${brightnessSlider.value}%) contrast(125%) saturate(140%) sepia(15%)`;
        }
        context.filter = filters;
        context.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = `enhanced-photo-${qualityValue}p.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});
