const pickButton = document.getElementById('pick-button');
const inputField = document.getElementById('input-field');
const sizePick = document.getElementById('size-pick');
const typePick = document.getElementById('type-pick');
const meterBar = document.getElementById('meter-bar');
const labelPc = document.getElementById('label-pc');
const labelFr = document.getElementById('label-fr');
const outputView = document.getElementById('output-view');
const saveButton = document.getElementById('save-button');
const canvas = document.getElementById('hidden-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

let resultData = null;

pickButton.onclick = () => inputField.click();

inputField.onchange = function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 12) {
                alert("Please pick a video under 10 seconds.");
                return;
            }
            process(file);
        };
    }
};

async function process(file) {
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('work-screen').classList.add('active');

    const targetWidth = parseInt(sizePick.value);
    const mimeType = typePick.value;
    const video = document.createElement('video');
    
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    
    await video.play();

    const scale = targetWidth / video.videoWidth;
    canvas.width = targetWidth;
    canvas.height = video.videoHeight * scale;

    const stream = canvas.captureStream(60);
    
    let bitrate = 8000000; 
    if (targetWidth >= 3840) bitrate = 50000000; 
    if (targetWidth >= 7680) bitrate = 150000000;

    const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm',
        videoBitsPerSecond: bitrate
    });

    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
        resultData = new Blob(chunks, { type: mimeType });
        finish();
    };

    recorder.start();

    let frames = 0;
    const totalTime = video.duration;

    function step() {
        if (video.paused || video.ended) {
            recorder.stop();
            video.pause();
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        frames++;
        const progress = Math.min((video.currentTime / totalTime) * 100, 100);
        
        meterBar.style.width = progress + '%';
        labelPc.innerText = Math.floor(progress) + '%';
        labelFr.innerText = 'Frame ' + frames;

        requestAnimationFrame(step);
    }

    step();
}

function finish() {
    const finalUrl = URL.createObjectURL(resultData);
    document.getElementById('work-screen').classList.remove('active');
    document.getElementById('final-screen').classList.add('active');
    
    outputView.src = finalUrl;
    outputView.play();

    saveButton.onclick = () => {
        const ext = typePick.value.split('/')[1].replace('quicktime', 'mov');
        const a = document.createElement('a');
        a.href = finalUrl;
        a.download = 'Video_' + Date.now() + '.' + ext;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
}
