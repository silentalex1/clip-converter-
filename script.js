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
    const qualitySelect = document.getElementById('quality-select');
    const canvas = document.getElementById('canvas');

    let originalFileBlob = null;
    let isProcessing = false;

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('video/')) {
            alert('Please select a valid video file.');
            return;
        }
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
        if (isProcessing || !originalFileBlob) {
            alert("Please select a file or wait for the current process to finish.");
            return;
        }

        isProcessing = true;
        downloadBtn.disabled = true;
        processingStatus.textContent = "Preparing your download...";
        
        const needsProcessing = optimizeCheckbox.checked || qualitySelect.value !== 'source';

        if (!needsProcessing) {
            downloadFile(URL.createObjectURL(originalFileBlob), false);
            return;
        }

        processingStatus.textContent = "Processing video... this can take some time.";
        try {
            const processedBlob = await processVideo(originalFileBlob);
            downloadFile(URL.createObjectURL(processedBlob), true);
        } catch (error) {
            console.error("Processing failed:", error);
            processingStatus.textContent = `Error: ${error.message}. Downloading original file.`;
            downloadFile(URL.createObjectURL(originalFileBlob), false);
        }
    });
    
    function downloadFile(url, wasProcessed) {
        const selectedFormat = document.getElementById('convert-select').value;
        const originalName = originalFileBlob.name.split('.').slice(0, -1).join('.');
        const finalExtension = wasProcessed ? 'mp4' : selectedFormat;
        const a = document.createElement('a');
        a.href = url;
        a.download = `${originalName}-enhanced.${finalExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (!wasProcessed) processingStatus.textContent = "";
        downloadBtn.disabled = false;
        isProcessing = false;
    }

    async function processVideo(videoFile) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.src = URL.createObjectURL(videoFile);
            
            video.onloadedmetadata = () => {
                const targetFrameRate = optimizeCheckbox.checked ? 30 : 0;
                const quality = qualitySelect.value;
                const ratio = video.videoWidth / video.videoHeight;

                if (quality !== 'source') {
                    const targetHeight = parseInt(quality, 10);
                    canvas.height = targetHeight;
                    canvas.width = targetHeight * ratio;
                } else {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                const context = canvas.getContext('2d');
                if (quality === '1080') {
                    context.filter = 'contrast(105%) saturate(120%) brightness(102%) sharpen(10%)';
                }

                const mimeType = 'video/mp4';
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    return reject(new Error(`${mimeType} format is not supported by your browser.`));
                }

                const stream = canvas.captureStream(targetFrameRate || undefined);
                const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
                const chunks = [];
                let framesProcessed = 0;

                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: mimeType });
                    URL.revokeObjectURL(video.src);
                    resolve(blob);
                };
                recorder.onerror = (e) => {
                    URL.revokeObjectURL(video.src);
                    reject(e);
                };
                
                let currentTime = 0;
                const duration = video.duration;
                const frameInterval = 1 / (targetFrameRate || 30);
                
                const processNextFrame = () => {
                    if (currentTime < duration) {
                        video.currentTime = currentTime;
                    } else {
                        recorder.stop();
                    }
                };
                
                video.onseeked = () => {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    framesProcessed++;
                    processingStatus.textContent = `Processing... ${Math.round((currentTime / duration) * 100)}%`;
                    currentTime += frameInterval; 
                    requestAnimationFrame(processNextFrame);
                };
                
                recorder.start();
                processNextFrame();
            };
            video.onerror = () => reject(new Error('Failed to load video. The file may be corrupt.'));
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

    const formats = ['mov', 'avi', 'mkv', 'gif', 'webm'];
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
