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

    if (!fileInput) return;

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
                    beforeImage.src = imageUrl;
                    afterImage.src = imageUrl;
                    setTimeout(() => {
                        processingContainer.style.display = 'none';
                        conversionSection.style.display = 'flex';
                        setTimeout(() => {
                            conversionSection.style.opacity = '1';
                        }, 50);
                    }, 500);
                };
                reader.readAsDataURL(file);
            }
        }, 20);
    });
    
    const moveSlider = (value) => {
        afterImageContainer.style.width = `${value}%`;
        sliderLine.style.left = `${value}%`;
        sliderHandle.style.left = `${value}%`;
    };

    sliderInput.addEventListener('input', (e) => {
        moveSlider(e.target.value);
    });

    downloadBtn.addEventListener('click', () => {
        if (!afterImage.src || afterImage.src.endsWith('/')) {
            alert("Please select a photo first.");
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const context = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            context.filter = 'contrast(110%) saturate(120%) brightness(105%)';
            context.drawImage(img, 0, 0);

            const link = document.createElement('a');
            link.download = 'enhanced-photo.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = afterImage.src;
    });
});
