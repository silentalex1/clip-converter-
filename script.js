const pickBtn = document.getElementById('pick-btn');
const fileIn = document.getElementById('file-in');
const resPick = document.getElementById('res-pick');
const typePick = document.getElementById('type-pick');
const fillBar = document.getElementById('fill-bar');
const statPct = document.getElementById('stat-pct');
const statFr = document.getElementById('stat-fr');
const outVideo = document.getElementById('out-video');
const saveBtn = document.getElementById('save-btn');
const canvas = document.getElementById('engine');
const ctx = canvas.getContext('2d');

let savedBlob = null;
let savedName = "";

pickBtn.onclick = () => fileIn.click();

fileIn.onchange = function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 11) {
                alert("Please use a video that is 10 seconds or less.");
                return;
            }
            runEngine(file);
        };
    }
};

async function runEngine(file) {
    document.getElementById('page-1').classList.remove('active');
    document.getElementById('page-2').classList.add('active');

    const width = parseInt(resPick.value);
    const parts = typePick.value.split('|');
    const mime = parts[0];
    const ext = parts[1];
    
    document.getElementById('tag').innerText = width >= 7680 ? "8K BEST" : (width >= 3840 ? "4K ULTRA" : "HD QUALITY");

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    
    await video.play();

    const ratio = video.videoHeight / video.videoWidth;
    canvas.width = width;
    canvas.height = width * ratio;

    const stream = canvas.captureStream(60);
    const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mime) ? mime : 'video/webm',
        videoBitsPerSecond: width * 15000 
    });

    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
        savedBlob = new Blob(chunks, { type: mime });
        savedName = `LiveMaker_${width}p_${Date.now()}${ext}`;
        showOut();
    };

    recorder.start();

    let frame = 0;
    const dur = video.duration;

    function paint() {
        if (video.paused || video.ended) {
            recorder.stop();
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        frame++;
        const p = Math.min((video.currentTime / dur) * 100, 100);
        
        fillBar.style.width = p + '%';
        statPct.innerText = Math.floor(p) + '%';
        statFr.innerText = 'Frame: ' + frame;

        requestAnimationFrame(paint);
    }

    paint();
}

function showOut() {
    const url = URL.createObjectURL(savedBlob);
    document.getElementById('page-2').classList.remove('active');
    document.getElementById('page-3').classList.add('active');
    
    outVideo.src = url;
    outVideo.play();

    saveBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = savedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}
