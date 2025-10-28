document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const customFileUploadButton = document.querySelector('.custom-file-upload');
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
                    conversionSection.style.display = 'flex';
                    videoPreview.src = URL.createObjectURL(file);
                    videoPreview.play();
                }, 500);
            }
        }, 30);
    });

    downloadBtn.addEventListener('click', () => {
        if (!videoPreview.src) {
            alert("Please select a file first.");
            return;
        }
        alert("Download functionality would be implemented on a real server. This is a demonstration.");
        const a = document.createElement('a');
        a.href = videoPreview.src;
        a.download = `converted-${Date.now()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
