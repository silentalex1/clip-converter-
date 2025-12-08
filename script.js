document.addEventListener('DOMContentLoaded', () => {
    const introLayer = document.getElementById('intro-layer');
    const introIcon = document.getElementById('intro-icon');
    const mainInterface = document.getElementById('main-interface');
    
    const uploadSection = document.getElementById('upload-section');
    const chooseBtn = document.getElementById('choose-clip-btn');
    const fileInput = document.getElementById('file-input');
    
    const loadingContainer = document.getElementById('loading-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    const editorSection = document.getElementById('editor-section');
    const userVideo = document.getElementById('user-video');
    const downloadBtn = document.getElementById('download-btn');
    const formatSelect = document.getElementById('format-select');

    let selectedFile = null;

    setTimeout(() => {
        introIcon.classList.add('slide-out-right');
        
        setTimeout(() => {
            introLayer.classList.add('fade-out');
            mainInterface.classList.remove('opacity-0');
            mainInterface.classList.add('fade-in');
            
            setTimeout(() => {
                introLayer.style.display = 'none';
            }, 1000);
        }, 800);
    }, 1000);

    chooseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            selectedFile = e.target.files[0];
            startProcessingAnimation();
        }
    });

    function startProcessingAnimation() {
        uploadSection.style.display = 'none';
        loadingContainer.classList.remove('hidden');
        
        let width = 0;
        const interval = setInterval(() => {
            const increment = Math.random() * 5 + 1; 
            width += increment;
            
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
                finishLoading();
            }
            
            progressBar.style.width = width + '%';
            progressText.innerText = Math.floor(width) + '%';
        }, 100);
    }

    function finishLoading() {
        setTimeout(() => {
            loadingContainer.style.opacity = '0';
            loadingContainer.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                loadingContainer.style.display = 'none';
                showEditor();
            }, 500);
        }, 500);
    }

    function showEditor() {
        editorSection.classList.remove('hidden');
        
        const fileURL = URL.createObjectURL(selectedFile);
        userVideo.src = fileURL;
        userVideo.load();
        
        setTimeout(() => {
            editorSection.classList.add('active-editor');
        }, 50);
    }

    downloadBtn.addEventListener('click', () => {
        if (!selectedFile) return;

        const originalName = selectedFile.name.split('.')[0];
        const newExtension = formatSelect.value;
        const newFileName = `${originalName}_edited.${newExtension}`;

        const a = document.createElement('a');
        a.href = userVideo.src;
        a.download = newFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = `<span>Downloaded!</span>`;
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
        }, 3000);
    });
});