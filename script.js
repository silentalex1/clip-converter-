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
    const btnText = document.getElementById('btn-text');
    const formatSelect = document.getElementById('format-select');
    const videoWrapper = document.getElementById('video-wrapper');

    let selectedFile = null;

    setTimeout(() => {
        introIcon.classList.add('slide-out-right');
        
        setTimeout(() => {
            introLayer.classList.add('fade-out');
            mainInterface.classList.remove('opacity-0');
            mainInterface.classList.add('fade-in');
            
            setTimeout(() => {
                introLayer.style.display = 'none';
            }, 800);
        }, 600);
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
        loadingContainer.classList.add('flex');
        
        let width = 0;
        
        const fastInterval = setInterval(() => {
            const increment = Math.random() * 8 + 2; 
            width += increment;
            
            if (width >= 100) {
                width = 100;
                clearInterval(fastInterval);
                finishLoading();
            }
            
            progressBar.style.width = width + '%';
            progressText.innerText = Math.floor(width) + '%';
        }, 80);
    }

    function finishLoading() {
        setTimeout(() => {
            loadingContainer.style.opacity = '0';
            loadingContainer.style.transform = 'translateY(-20px)';
            loadingContainer.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                loadingContainer.style.display = 'none';
                showEditor();
            }, 500);
        }, 300);
    }

    function showEditor() {
        editorSection.classList.remove('hidden');
        editorSection.classList.add('flex');
        
        const fileURL = URL.createObjectURL(selectedFile);
        userVideo.src = fileURL;
        userVideo.load();
        
        setTimeout(() => {
            editorSection.classList.add('active-editor');
            videoWrapper.classList.add('animate-fade-in-up');
        }, 50);
    }

    downloadBtn.addEventListener('click', () => {
        if (!selectedFile) return;

        const originalText = btnText.innerText;
        btnText.innerText = "Encoding...";
        downloadBtn.disabled = true;
        downloadBtn.classList.add('opacity-75', 'cursor-not-allowed');

        setTimeout(() => {
            const originalName = selectedFile.name.split('.')[0];
            const newExtension = formatSelect.value;
            const newFileName = `${originalName}_converted.${newExtension}`;

            const a = document.createElement('a');
            a.href = userVideo.src; 
            a.download = newFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            btnText.innerText = "Saved!";
            downloadBtn.classList.remove('from-blue-600', 'to-indigo-600');
            downloadBtn.classList.add('from-green-500', 'to-emerald-600');
            
            setTimeout(() => {
                btnText.innerText = originalText;
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('opacity-75', 'cursor-not-allowed', 'from-green-500', 'to-emerald-600');
                downloadBtn.classList.add('from-blue-600', 'to-indigo-600');
            }, 3000);
        }, 1500);
    });
});