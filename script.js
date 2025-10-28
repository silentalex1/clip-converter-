document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const customFileUploadButton = document.querySelector('.custom-file-upload');
    const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    const conversionSection = document.querySelector('.conversion-section');
    const videoPreview = document.getElementById('video-preview');
    const downloadBtn = document.querySelector('.download-btn');
    const navUserDisplay = document.getElementById('nav-user-display');
    const navAuthSection = document.getElementById('nav-auth-section');

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        navUserDisplay.textContent = loggedInUser;
        navAuthSection.innerHTML = '';
    }

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
        if (videoPreview.src) {
            const a = document.createElement('a');
            a.href = videoPreview.src;
            const selectedFormat = document.getElementById('convert-select').value;
            a.download = `converted-file.${selectedFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert("Please select a file first.");
        }
    });
});
