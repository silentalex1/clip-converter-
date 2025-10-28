document.addEventListener('DOMContentLoaded', () => {
    const fileUploadContainer = document.getElementById('file-upload-container');
    const videoFileInput = document.getElementById('file-upload-video');
    const photoFileInput = document.getElementById('file-upload-photo');
    const configFileInput = document.getElementById('file-upload-config');
    
    const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    
    const mediaProcessingArea = document.querySelector('.media-processing-area');
    const videoPreview = document.getElementById('video-preview');
    const photoPreview = document.getElementById('photo-preview');
    const configVideoPreview = document.getElementById('config-video-preview');
    
    const navUser = document.getElementById('nav-user');
    const signinBtn = document.getElementById('signin-btn');

    document.querySelectorAll('.premium-option').forEach(option => {
        option.innerHTML += ' <span class="crown-icon"></span>';
    });
    
    const loggedInUser = localStorage.getItem('clipConverterUser');
    if (loggedInUser) {
        navUser.textContent = loggedInUser;
        signinBtn.style.display = 'none';
    }

    const startLoadingProcess = (callback) => {
        fileUploadContainer.style.display = 'none';
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
                    mediaProcessingArea.style.display = 'block';
                    if(callback) callback();
                }, 500);
            }
        }, 20);
    };

    videoFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        startLoadingProcess(() => {
            videoPreview.src = URL.createObjectURL(file);
        });
    });

    photoFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => photoPreview.src = e.target.result;
        reader.readAsDataURL(file);
    });
    
    configFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        configVideoPreview.src = URL.createObjectURL(file);
    });

    document.querySelectorAll('.media-tab-link').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.media-tab-link').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.media-tab-content').forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    document.querySelectorAll('.download-btn').forEach(button => {
        button.addEventListener('click', () => {
            alert("Download initiated. This is a frontend demonstration.");
        });
    });
});
