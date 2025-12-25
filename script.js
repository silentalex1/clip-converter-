const triggerUpload = document.getElementById('trigger-upload');
const mediaInput = document.getElementById('media-input');
const resSelector = document.getElementById('res-selector');
const uploadView = document.getElementById('upload-view');
const processView = document.getElementById('process-view');
const exportView = document.getElementById('export-view');
const meterFill = document.getElementById('meter-fill');
const percentVal = document.getElementById('percent-val');
const frameVal = document.getElementById('frame-val');
const finalPreview = document.getElementById('final-preview');
const downloadAction = document.getElementById('download-action');
const renderCanvas = document.getElementById('render-canvas');
const ctx = renderCanvas.getContext('2d');

let masterBlob = null;

triggerUpload.addEventListener('click', () => mediaInput.click());

mediaInput.addEventListener('change', async function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 11) {
                alert("Please select a clip under 10 seconds.");
                return;
            }
            beginMastering(file);
        };
    }
});

async function beginMastering(file) {
    uploadView.classList.remove('active');
    processView.classList.add('active');

    const targetWidth = parseInt(resSelector.value);
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    
    await video.play();

    const aspect = video.videoHeight / video.videoWidth;
    renderCanvas.width = targetWidth;
    renderCanvas.height = targetWidth * aspect;

    const stream = renderCanvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 50000000
    });

    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
        masterBlob = new Blob(chunks, { type: 'video/quicktime' });
        finalizeExport();
    };

    recorder.start();

    const duration = video.duration;
    let frameCount = 0;

    const processFrame = () => {
        if (video.paused || video.ended) {
            recorder.stop();
            return;
        }

        ctx.drawImage(video, 0, 0, renderCanvas.width, renderCanvas.height);
        
        frameCount++;
        const progress = Math.min((video.currentTime / duration) * 100, 100);
        
        meterFill.style.width = `${progress}%`;
        percentVal.innerText = `${Math.floor(progress)}%`;
        frameVal.innerText = `Frame: ${frameCount}`;

        requestAnimationFrame(processFrame);
    };

    processFrame();
}

function finalizeExport() {
    const url = URL.createObjectURL(masterBlob);
    processView.classList.remove('active');
    exportView.classList.add('active');
    
    finalPreview.src = url;
    finalPreview.play();

    downloadAction.onclick = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `LivePhoto_8K_${Date.now()}.mov`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

document.querySelectorAll('button').forEach(b => {
    b.addEventListener('touchstart', () => b.style.transform = 'scale(0.97)');
    b.addEventListener('touchend', () => b.style.transform = 'scale(1)');
});
