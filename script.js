document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const uploadContainer = document.getElementById('file-upload-container');
    const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    const conversionSection = document.querySelector('.conversion-section');
    const videoPreview = document.getElementById('video-preview');
    const downloadBtn = document.querySelector('.download-btn');
    const navUser = document.getElementById('nav-user');
    const signinBtn = document.getElementById('signin-btn');

    const loggedInUser = localStorage.getItem('clipConverterUser');
    if (loggedInUser) {
        navUser.textContent = loggedInUser;
        signinBtn.style.display = 'none';
    }

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        uploadContainer.style.display = 'none';
        conversionSection.style.display = 'flex';
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
                    conversionSection.style.opacity = '1';
                    videoPreview.src = URL.createObjectURL(file);
                    videoPreview.dataset.fileName = file.name.split('.').slice(0, -1).join('.');
                    videoPreview.play();
                }, 500);
            }
        }, 25);
    });

    downloadBtn.addEventListener('click', () => {
        const formatSelect = document.getElementById('convert-select');
        const selectedFormat = formatSelect.value;
        const originalName = videoPreview.dataset.fileName || 'converted';

        if (!videoPreview.src) {
            alert("Please select a file first.");
            return;
        }
        const a = document.createElement('a');
        a.href = videoPreview.src;
        a.download = `${originalName}.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
