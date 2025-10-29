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
    let isPainting = false;
    let currentImage = new Image();

    const applyWatermark = (context, width, height) => {
        const watermarkText = "enhanced @ clipconverter.cfd";
        const fontSize = Math.max(12, Math.min(width * 0.03, height * 0.03));
        context.font = `600 ${fontSize}px Poppins`;
        context.fillStyle = "rgba(255, 255, 255, 0.5)";
        context.textAlign = "right";
        context.textBaseline = "bottom";
        context.fillText(watermarkText, width - 15, height - 15);
    };

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
                    currentImage.onload = () => {
                        const context = canvas.getContext('2d');
                        canvas.width = currentImage.naturalWidth;
                        canvas.height = currentImage.naturalHeight;
                        context.drawImage(currentImage, 0, 0);
                        applyWatermark(context, canvas.width, canvas.height);
                        const watermarkedUrl = canvas.toDataURL();
                        
                        beforeImage.src = imageUrl;
                        afterImage.src = watermarkedUrl;
                        currentImage.src = watermarkedUrl;

                        setTimeout(() => {
                            processingContainer.style.display = 'none';
                            conversionSection.style.display = 'flex';
                            setTimeout(() => conversionSection.style.opacity = '1', 50);
                        }, 500);
                    };
                    currentImage.src = imageUrl;
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

    comparisonSlider.addEventListener('mousedown', (e) => {
        if (isObjectRemoverActive) {
            isPainting = true;
            removeObjectAt(e.clientX, e.clientY);
        } else {
            handleSliderInteraction(e.clientX);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', () => window.removeEventListener('mousemove', onMouseMove), { once: true });
        }
    });

    comparisonSlider.addEventListener('mousemove', (e) => {
        if (isObjectRemoverActive && isPainting) {
            removeObjectAt(e.clientX, e.clientY);
        }
    });

    window.addEventListener('mouseup', () => { isPainting = false; });
    const onMouseMove = (e) => handleSliderInteraction(e.clientX);

    objectRemoverBtn.addEventListener('click', () => {
        isObjectRemoverActive = !isObjectRemoverActive;
        objectRemoverBtn.classList.toggle('active', isObjectRemoverActive);
        comparisonSlider.classList.toggle('slider-disabled', isObjectRemoverActive);
        comparisonSlider.classList.toggle('remover-active', isObjectRemoverActive);
    });

    majesticModeToggle.addEventListener('change', () => {
        afterImage.classList.toggle('majestic', majesticModeToggle.checked);
    });
    
    brightnessSlider.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--brightness-filter', `brightness(${e.target.value}%)`);
    });

    function removeObjectAt(clientX, clientY) {
        const rect = comparisonSlider.getBoundingClientRect();
        const x = (clientX - rect.left) * (currentImage.naturalWidth / rect.width);
        const y = (clientY - rect.top) * (currentImage.naturalHeight / rect.height);
        
        const context = canvas.getContext('2d');
        canvas.width = currentImage.naturalWidth;
        canvas.height = currentImage.naturalHeight;
        context.drawImage(currentImage, 0, 0);

        const brushSize = 40;
        const sampleOffset = brushSize;
        const sx = x - sampleOffset < 0 ? x + sampleOffset : x - sampleOffset;
        
        context.drawImage(canvas, sx, y - brushSize / 2, brushSize, brushSize, x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);

        applyWatermark(context, canvas.width, canvas.height);
        
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
        
        if (qualitySelect.value === 'original') {
            canvas.width = currentImage.naturalWidth;
            canvas.height = currentImage.naturalHeight;
        } else {
            canvas.width = (ratio >= 1) ? qualityValue : Math.round(qualityValue * ratio);
            canvas.height = (ratio < 1) ? qualityValue : Math.round(qualityValue / ratio);
        }

        let filters = `brightness(${brightnessSlider.value}%) contrast(115%) saturate(120%)`;
        if (majesticModeToggle.checked) {
            filters = `brightness(${brightnessSlider.value}%) contrast(125%) saturate(140%) sepia(10%)`;
        }
        context.filter = filters;
        context.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
        applyWatermark(context, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.download = `enhanced-photo-${qualitySelect.value}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});
