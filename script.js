const pickBtn = document.getElementById('pick-btn');
const fileGet = document.getElementById('file-get');
const sizePick = document.getElementById('size-pick');
const startPage = document.getElementById('start-page');
const workPage = document.getElementById('work-page');
const donePage = document.getElementById('done-page');
const fill = document.getElementById('fill');
const num = document.getElementById('num');
const viewFinal = document.getElementById('view-final');
const saveBtn = document.getElementById('save-btn');
const bigDraw = document.getElementById('big-draw');
const ctx = bigDraw.getContext('2d');

let finalFile = null;

pickBtn.onclick = () => fileGet.click();

fileGet.onchange = function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const v = document.createElement('video');
        v.src = URL.createObjectURL(file);
        v.onloadedmetadata = () => {
            if (v.duration > 11) {
                alert("Clip is too long. Keep it under 10s.");
                return;
            }
            startFixing(file);
        };
    }
};

async function startFixing(file) {
    startPage.classList.remove('active');
    workPage.classList.add('active');

    const v = document.createElement('video');
    v.src = URL.createObjectURL(file);
    v.muted = true;
    v.playsInline = true;
    await v.play();

    const quality = parseInt(sizePick.value);
    const ratio = v.videoHeight / v.videoWidth;
    bigDraw.width = quality;
    bigDraw.height = quality * ratio;

    const stream = bigDraw.captureStream(60);
    const rec = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 100000000 
    });

    const bits = [];
    rec.ondataavailable = (e) => bits.push(e.data);
    rec.onstop = () => {
        finalFile = new Blob(bits, { type: 'video/quicktime' });
        showDone();
    };

    rec.start();

    function draw() {
        if (v.paused || v.ended) {
            rec.stop();
            return;
        }
        ctx.drawImage(v, 0, 0, bigDraw.width, bigDraw.height);
        let p = (v.currentTime / v.duration) * 100;
        fill.style.width = p + '%';
        num.innerText = Math.floor(p) + '%';
        requestAnimationFrame(draw);
    }
    draw();
}

function showDone() {
    const url = URL.createObjectURL(finalFile);
    workPage.classList.remove('active');
    donePage.classList.add('active');
    viewFinal.src = url;
    viewFinal.play();

    saveBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Live_Photo_${Date.now()}.mov`;
        a.click();
    };
}

document.querySelectorAll('button').forEach(btn => {
    btn.ontouchstart = () => btn.style.opacity = "0.7";
    btn.ontouchend = () => btn.style.opacity = "1";
});
