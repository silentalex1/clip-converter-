document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const mainUploader = document.getElementById('main-uploader');
    const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    const editorContainer = document.querySelector('.editor-container');
    const videoPreview = document.getElementById('video-preview');
    const photoPreview = document.getElementById('photo-preview');
    const navUser = document.getElementById('nav-user');
    const signinBtn = document.getElementById('signin-btn');
    const editorTabs = document.querySelectorAll('.editor-tab-link');
    const tabContents = document.querySelectorAll('.editor-tab-content');

    const loggedInUser = localStorage.getItem('clipConverterUser');
    if (loggedInUser) {
        navUser.textContent = loggedInUser;
        signinBtn.style.display = 'none';
    }

    editorTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            editorTabs.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        mainUploader.style.display = 'none';
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
                    editorContainer.style.display = 'block';
                    const fileURL = URL.createObjectURL(file);
                    
                    if (file.type.startsWith('video/')) {
                        videoPreview.src = fileURL;
                        document.querySelector('[data-tab="video-editor"]').click();
                    } else if (file.type.startsWith('image/')) {
                        photoPreview.src = fileURL;
                        photoPreview.style.display = 'block';
                        document.querySelector('[data-tab="photo-editor"]').click();
                    }
                }, 500);
            }
        }, 30);
    });

    document.querySelectorAll('.download-btn').forEach(button => {
        button.addEventListener('click', () => {
            alert("Download initiated. This is a frontend demonstration.");
        });
    });
});
