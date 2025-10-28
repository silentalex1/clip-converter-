document.addEventListener('DOMContentLoaded', () => {
    const initialBackground = document.querySelector('.initial-background');
    const animationText = document.querySelector('.animation-text');
    const fileUploadContainer = document.querySelector('.file-upload-container');
    const fileInput = document.getElementById('file-upload');
    const customFileUploadButton = document.querySelector('.custom-file-upload');
    const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    const conversionSection = document.querySelector('.conversion-section');
    const videoPreview = document.getElementById('video-preview');
    const downloadBtn = document.querySelector('.download-btn');

    setTimeout(() => {
        initialBackground.classList.add('slide-up');
    }, 2800);

    setTimeout(() => {
        fileUploadContainer.classList.add('visible');
    }, 3200);

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        customFileUploadButton.style.display = 'none';
        loadingBarWrapper.style.display = 'block';
        let currentPercent = 0;
        const loadingInterval = setInterval(() => {
            currentPercent++;
            loadingBar.style.width = `${currentPercent}%`;
            loadingPercent.textContent = `${currentPercent}%`;
            if (currentPercent >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    loadingBarWrapper.style.display = 'none';
                    const videoURL = URL.createObjectURL(file);
                    videoPreview.src = videoURL;
                    conversionSection.classList.add('visible');
                }, 500);
            }
        }, 30);
    });

    downloadBtn.addEventListener('click', () => {
        const formatSelect = document.getElementById('convert-select');
        const qualitySelect = document.getElementById('quality-select');
        const selectedFormat = formatSelect.value;
        const selectedQuality = qualitySelect.value;
        
        if (videoPreview.src) {
            alert(`Preparing to download your file as ${selectedFormat} in ${selectedQuality}.`);
            const a = document.createElement('a');
            a.href = videoPreview.src;
            a.download = `converted-video.${selectedFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert("Please select a file first.");
        }
    });
});
