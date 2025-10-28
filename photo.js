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
    const navbar = document.getElementById('navbar');
    const formatSpinner = document.getElementById('format-spinner');

    const loggedInUser = localStorage.getItem('clipConverterUser');
    if (loggedInUser) {
        navUser.textContent = loggedInUser;
        signinBtn.style.display = 'none';
    }

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        uploadContainer.style.display = 'none';
        loadingBarWrapper.style.display = 'block';
        let currentPercent = 0;
        const fileSizeMB = file.size / (1024 * 1024);
        const estimatedTime = Math.max(2000, fileSizeMB * 150); 
        const intervalStepTime = estimatedTime / 100;

        const loadingInterval = setInterval(() => {
            currentPercent++;
            loadingBar.style.width = `${currentPercent}%`;
            loadingPercent.textContent = `${currentPercent}%`;
            if (currentPercent >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    loadingBarWrapper.style.display = 'none';
                    conversionSection.style.display = 'flex';
                    conversionSection.style.opacity = '1';
                    videoPreview.src = URL.createObjectURL(file);
                    videoPreview.dataset.fileName = file.name.split('.').slice(0, -1).join('.');
                    videoPreview.play();
                }, 500);
            }
        }, intervalStepTime);
    });

    downloadBtn.addEventListener('click', () => {
        const selectedFormat = document.getElementById('convert-select').value;
        const originalName = videoPreview.dataset.fileName || 'converted';
        if (!videoPreview.src) {
            alert("Please select a file first to begin.");
            return;
        }
        const a = document.createElement('a');
        a.href = videoPreview.src;
        a.download = `${originalName}.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    let isDown = false;
    let startX;
    let scrollLeft;
    navbar.addEventListener('mousedown', (e) => {
        isDown = true;
        navbar.style.cursor = 'grabbing';
        startX = e.pageX - navbar.offsetLeft;
        scrollLeft = navbar.scrollLeft;
    });
    navbar.addEventListener('mouseleave', () => { isDown = false; navbar.style.cursor = 'default'; });
    navbar.addEventListener('mouseup', () => { isDown = false; navbar.style.cursor = 'default'; });
    navbar.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - navbar.offsetLeft;
        const walk = (x - startX) * 2; 
        navbar.scrollLeft = scrollLeft - walk;
    });

    const formats = ['mov', 'avi', 'mkv', 'wav', 'flac'];
    let formatIndex = 0;
    setInterval(() => {
        formatSpinner.classList.add('fade');
        setTimeout(() => {
            formatIndex = (formatIndex + 1) % formats.length;
            formatSpinner.textContent = formats[formatIndex];
            formatSpinner.classList.remove('fade');
        }, 400);
    }, 2000);
});
