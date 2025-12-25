const goBtn = document.getElementById('go-btn');
const fileGet = document.getElementById('file-get');
const sizePick = document.getElementById('size-pick');
const typePick = document.getElementById('type-pick');
const barMove = document.getElementById('bar-move');
const pctShow = document.getElementById('pct-show');
const frShow = document.getElementById('fr-show');
const viewFinal = document.getElementById('view-final');
const saveBtn = document.getElementById('save-btn');
const engine = document.getElementById('core-engine');
const ctx = engine.getContext('2d');

let outputBlob = null;
let outputName = "";

goBtn.onclick = () => fileGet.click();

fileGet.onchange = function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.src = URL.createObjectURL(file);
        
        v.onloadedmetadata = function() {
            window.URL.revokeObjectURL(v.src);
            if (v.duration > 11) {
                alert("Please use a clip under 10 seconds.");
                return;
            }
            work(file);
        };
    }
};

async function work(file) {
    document.getElementById('page-1').classList.remove('active');
    document.getElementById('page-2').classList.add('active');

    const width = parseInt(sizePick.value);
    const config = typePick.value.split('|');
    const mime = config[0];
    const ext = config[1];
    
    document.getElementById('res-tag').innerText = width >= 7680 ? "8K" : (width >= 3840 ? "4K" : "HD");

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    
    await video.play();

    const scale = video.videoHeight / video.videoWidth;
    engine.width = width;
    engine.height = width * scale;

    const stream = engine.captureStream(60);
    const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mime) ? mime : 'video/webm',
        videoBitsPerSecond: width * 18000 
    });

    const parts = [];
    recorder.ondataavailable = e => parts.push(e.data);
    recorder.onstop = () => {
        outputBlob = new Blob(parts, { type: mime });
        outputName = `Live_${width}p_${Date.now()}${ext}`;
        done();
    };

    recorder.start();

    let frames = 0;
    const total = video.duration;

    function frame() {
        if (video.paused || video.ended) {
            recorder.stop();
            return;
        }

        ctx.drawImage(video, 0, 0, engine.width, engine.height);
        
        frames++;
        const p = Math.min((video.currentTime / total) * 100, 100);
        
        barMove.style.width = p + '%';
        pctShow.innerText = Math.floor(p) + '%';
        frShow.innerText = 'Frame ' + frames;

        requestAnimationFrame(frame);
    }

    frame();
}

function done() {
    const url = URL.createObjectURL(outputBlob);
    document.getElementById('page-2').classList.remove('active');
    document.getElementById('page-3').classList.add('active');
    
    viewFinal.src = url;
    viewFinal.play();

    saveBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = outputName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
}
