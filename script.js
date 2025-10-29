document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const uploadContainer = document.getElementById('file-upload-container');
    const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    const processingStatus = document.getElementById('processing-status');
    const conversionSection = document.querySelector('.conversion-section');
    const videoPreview = document.getElementById('video-preview');
    const downloadBtn = document.getElementById('download-btn');
    const navbar = document.getElementById('navbar');
    const formatSpinner = document.getElementById('format-spinner');
    const optimizeCheckbox = document.getElementById('optimize-playback');
    const canvas = document.getElementById('canvas');

    let originalFileBlob = null;

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        originalFileBlob = file;
        uploadContainer.style.display = 'none';
        loadingBarWrapper.style.display = 'block';
        let currentPercent = 0;
        const interval = setInterval(() => {
            currentPercent++;
            loadingBar.style.width = `${currentPercent}%`;
            loadingPercent.textContent = `${currentPercent}%`;
            if (currentPercent >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loadingBarWrapper.style.display = 'none';
                    conversionSection.style.display = 'flex';
                    conversionSection.style.opacity = '1';
                    videoPreview.src = URL.createObjectURL(file);
                }, 500);
            }
        }, 30);
    });

    downloadBtn.addEventListener('click', async () => {
        if (!originalFileBlob) {
            alert("Please select a file first.");
            return;
        }

        downloadBtn.disabled = true;
        processingStatus.textContent = "Preparing your download...";

        if (!optimizeCheckbox.checked) {
            downloadFile(URL.createObjectURL(originalFileBlob));
            return;
        }

        processingStatus.textContent = "Optimizing video... this may take a moment.";
        try {
            const optimizedBlob = await optimizeVideo(originalFileBlob);
            downloadFile(URL.createObjectURL(optimizedBlob));
        } catch (error) {
            console.error("Optimization failed:", error);
            processingStatus.textContent = "Optimization failed. Downloading original file.";
            downloadFile(URL.createObjectURL(originalFileBlob));
        }
    });
    
    function downloadFile(url) {
        const selectedFormat = document.getElementById('convert-select').value;
        const originalName = originalFileBlob.name.split('.').slice(0, -1).join('.');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${originalName}-optimized.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        processingStatus.textContent = "";
        downloadBtn.disabled = false;
    }

    async function optimizeVideo(videoFile) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(videoFile);
            
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                const stream = canvas.captureStream(30);
                const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                const chunks = [];

                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
                recorder.onerror = reject;

                let currentTime = 0;
                video.currentTime = currentTime;

                video.onseeked = () => {
                    if (currentTime < video.duration) {
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        currentTime += 1/30;
                        video.currentTime = currentTime;
                    } else {
                        recorder.stop();
                        video.pause();
                    }
                };
                
                recorder.start();
                video.play();
                video.pause();
            };
            video.onerror = reject;
        });
    }

    let isDown = false;
    let startX, scrollLeft;
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
