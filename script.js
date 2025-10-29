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
            const videoElement = document.createElement('video');
            videoElement.preload = 'metadata';
            videoElement.muted = true;
            videoElement.src = URL.createObjectURL(videoFile);
            
            videoElement.onloadedmetadata = async () => {
                const quality = qualitySelect.value;
                const ratio = videoElement.videoWidth / videoElement.videoHeight;

                if (quality !== 'source') {
                    const targetHeight = parseInt(quality, 10);
                    canvas.height = targetHeight;
                    canvas.width = Math.round(targetHeight * ratio / 2) * 2;
                } else {
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                }

                const context = canvas.getContext('2d');
                if (qualitySelect.value.includes('1080')) {
                    context.filter = 'contrast(105%) saturate(115%) brightness(102%)';
                }

                let audioTrack;
                try {
                    const audioContext = new AudioContext();
                    const source = audioContext.createMediaElementSource(videoElement);
                    const destination = audioContext.createMediaStreamDestination();
                    source.connect(destination);
                    audioTrack = destination.stream.getAudioTracks()[0];
                } catch (e) {
                    console.warn("Could not process audio track.");
                }
                
                const videoStream = canvas.captureStream();
                const videoTrack = videoStream.getVideoTracks()[0];
                
                const streamTracks = [videoTrack];
                if(audioTrack) streamTracks.push(audioTrack);
                
                const combinedStream = new MediaStream(streamTracks);
                const mimeType = 'video/mp4';

                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    return reject(new Error(`${mimeType} format is not supported by your browser.`));
                }

                const recorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 8000000 });
                const chunks = [];
                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: mimeType });
                    URL.revokeObjectURL(videoElement.src);
                    resolve(blob);
                };
                recorder.onerror = (e) => reject(e);
                
                recorder.start();
                videoElement.play();

                const duration = videoElement.duration;
                let lastTime = -1;

                const renderLoop = () => {
                    if (videoElement.paused || videoElement.ended) {
                        if(recorder.state === "recording") recorder.stop();
                        return;
                    }
                    if (videoElement.currentTime !== lastTime) {
                        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                        processingStatus.textContent = `Processing... ${Math.round((videoElement.currentTime / duration) * 100)}%`;
                        lastTime = videoElement.currentTime;
                    }
                    requestAnimationFrame(renderLoop);
                };
                requestAnimationFrame(renderLoop);
            };
            videoElement.onerror = () => reject(new Error('Failed to load video. The file may be corrupt.'));
        });
    }

    const formats = ['mov', 'mkv', 'avi', 'wav', 'flac'];
    let formatIndex = 0;
    setInterval(() => {
        if (formatSpinner) {
            formatSpinner.classList.add('fade');
            setTimeout(() => {
                formatIndex = (formatIndex + 1) % formats.length;
                formatSpinner.textContent = formats[formatIndex];
                formatSpinner.classList.remove('fade');
            }, 400);
        }
    }, 2000);
});
