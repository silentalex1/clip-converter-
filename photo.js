document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const uploadContainer = document.getElementById('file-upload-container');
    const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    const conversionSection = document.querySelector('.conversion-section');
    const downloadBtn = document.getElementById('download-btn');
    const slider = document.getElementById('slider');
    const afterFigure = document.getElementById('after-figure');
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
                        if (loadingBarWrapper) {
                            loadingBarWrapper.style.display = 'none';
                        }
                        if (conversionSection) {
                            conversionSection.style.display = 'flex';
                            setTimeout(() => {
                                conversionSection.style.opacity = '1';
                            }, 50);
                        }
                    }, 500);
                };
                reader.readAsDataURL(file);
            }
        }, 20);
    });
    
    if (slider && afterFigure) {
        slider.addEventListener('input', (e) => {
            afterFigure.style.width = `${e.target.value}%`;
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!afterImage.src || afterImage.src.endsWith('/')) {
                alert("Please select a photo first.");
                return;
            }

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                if (canvas) {
                    const context = canvas.getContext('2d');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    context.filter = 'contrast(110%) saturate(120%) brightness(105%)';
                    context.drawImage(img, 0, 0);

                    const link = document.createElement('a');
                    link.download = 'enhanced-photo.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            };
            img.src = afterImage.src;
        });
    }
});
