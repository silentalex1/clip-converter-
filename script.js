const pickBtn = document.getElementById('pick-btn');
const videoFile = document.getElementById('video-file');
const quality = document.getElementById('quality');
const fill = document.getElementById('fill');
const percentText = document.getElementById('percent');
const frameText = document.getElementById('frame-count');
const view = document.getElementById('view');
const saveBtn = document.getElementById('save-btn');
const canvas = document.getElementById('work-canvas');
const ctx = canvas.getContext('2d');

let finalFile = null;

pickBtn.onclick = () => videoFile.click();

videoFile.onchange = function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 11) {
                alert("This video is too long. Use a clip under 10 seconds.");
                return;
            }
            start(file);
        };
    }
};

async function start(file) {
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-2').classList.add('active');

    const width = parseInt(quality.value);
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
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 100000000
    });

    const data = [];
    recorder.ondataavailable = e => data.push(e.data);
    recorder.onstop = () => {
        finalFile = new Blob(data, { type: 'video/quicktime' });
        done();
    };

    recorder.start();

    let count = 0;
    const duration = video.duration;

    function draw() {
        if (video.paused || video.ended) {
            recorder.stop();
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        count++;
        const p = Math.min((video.currentTime / duration) * 100, 100);
        
        fill.style.width = p + '%';
        percentText.innerText = Math.floor(p) + '%';
        frameText.innerText = 'Frame ' + count;

        requestAnimationFrame(draw);
    }

    draw();
}

function done() {
    const url = URL.createObjectURL(finalFile);
    document.getElementById('step-2').classList.remove('active');
    document.getElementById('step-3').classList.add('active');
    
    view.src = url;
    view.play();

    saveBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'LivePhoto_' + Date.now() + '.mov';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
}
