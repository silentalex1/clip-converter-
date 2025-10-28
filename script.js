document.addEventListener('DOMContentLoaded', () => {
const fileUploadContainer = document.getElementById('file-upload-container');
const videoFileInput = document.getElementById('file-upload-video');
const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
const loadingBar = document.querySelector('.loading-bar');
const loadingPercent = document.querySelector('.loading-percent');
const mediaProcessingArea = document.querySelector('.media-processing-area');
const videoPreview = document.getElementById('video-preview');
const startLoadingProcess = (file) => {
    fileUploadContainer.style.display = 'none';
    loadingBarWrapper.style.display = 'block';
    let currentPercent = 0;
    
    const loadingInterval = setInterval(() => {
        currentPercent++;
        loadingBar.style.width = `${currentPercent}%`;
        loadingPercent.style.left = `calc(${currentPercent}% - 10px)`;
        loadingPercent.textContent = `${currentPercent}%`;
        
        if (currentPercent >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingBarWrapper.style.display = 'none';
                mediaProcessingArea.style.display = 'block';
                videoPreview.src = URL.createObjectURL(file);
            }, 400);
        }
    }, 25);
};

videoFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        startLoadingProcess(file);
    }
});

document.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (!videoPreview.src) {
            alert("Please upload a video first.");
            return;
        }
        alert("Your video is being processed!");
    });
});
    
