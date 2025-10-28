document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const uploadContainer = document.getElementById('file-upload-container');
    const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    const conversionSection = document.querySelector('.conversion-section');
    const downloadBtn = document.getElementById('download-btn');
    const slider = document.getElementById('slider');
    const afterImageContainer = document.querySelector('.after-image-container');
    const beforeImage = document.getElementById('before-image');
    const afterImage = document.getElementById('after-image');
    const canvas = document.getElementById('canvas');

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        uploadContainer.style.display = 'none';
        loadingBarWrapper.style.display = 'block';

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
                        loadingBarWrapper.style.display = 'none';
                        conversionSection.style.display = 'flex';
                        requestAnimationFrame(() => {
                             conversionSection.style.opacity = '1';
                        });
                    }, 500);
                };
                reader.readAsDataURL(file);
            }
        }, 20);
    });
    
    slider.addEventListener('input', (e) => {
        afterImageContainer.style.width = `${e.target.value}%`;
    });

    downloadBtn.addEventListener('click', () => {
        if (!afterImage.src) {
            alert("Please select a photo first.");
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
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
