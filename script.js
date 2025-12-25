const btnPick = document.getElementById('btn-pick');
const inputSource = document.getElementById('input-source');
const resLevel = document.getElementById('res-level');
const extType = document.getElementById('ext-type');
const fillLevel = document.getElementById('fill-level');
const labelPct = document.getElementById('label-pct');
const labelFrame = document.getElementById('label-frame');
const outputView = document.getElementById('output-view');
const btnSave = document.getElementById('btn-save');
const canvas = document.getElementById('engine-canvas');
const ctx = canvas.getContext('2d');

let blobReady = null;
let nameReady = "";

btnPick.onclick = () => inputSource.click();

inputSource.onchange = function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 11) {
                alert("Please use a clip under 10 seconds.");
                return;
            }
            process(file);
        };
    }
};

async function process(file) {
    document.getElementById('ui-start').classList.remove('active');
    document.getElementById('ui-process').classList.add('active');

    const targetWidth = parseInt(resLevel.value);
    const formatData = extType.value.split('|');
    const mime = formatData[0];
    const extension = formatData[1];
    
    document.getElementById('res-badge').innerText = targetWidth >= 7680 ? "8K MASTER" : (targetWidth >= 3840 ? "4K ULTRA" : "HD QUALITY");

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    
    await video.play();

    const scale = video.videoHeight / video.videoWidth;
    canvas.width = targetWidth;
    canvas.height = targetWidth * scale;

    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mime) ? mime : 'video/webm',
        videoBitsPerSecond: targetWidth * 15000 
    });

    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
        blobReady = new Blob(chunks, { type: mime });
        nameReady = `Converted_${targetWidth}p_${Date.now()}${extension}`;
        finish();
    };

    recorder.start();

    let frames = 0;
    const dur = video.duration;

    function render() {
        if (video.paused || video.ended) {
            recorder.stop();
            video.pause();
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        frames++;
        const prog = Math.min((video.currentTime / dur) * 100, 100);
        
        fillLevel.style.width = prog + '%';
        labelPct.innerText = Math.floor(prog) + '%';
        labelFrame.innerText = 'Frame: ' + frames;

        requestAnimationFrame(render);
    }

    render();
}

function finish() {
    const url = URL.createObjectURL(blobReady);
    document.getElementById('ui-process').classList.remove('active');
    document.getElementById('ui-finish').classList.add('active');
    
    outputView.src = url;
    outputView.play();

    btnSave.onclick = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = nameReady;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}
