const uploadBtn = document.getElementById('upload-btn');
const videoInput = document.getElementById('video-input');
const uploadSection = document.getElementById('upload-section');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const progressFill = document.getElementById('progress-fill');
const percentageText = document.getElementById('percentage');

uploadBtn.addEventListener('click', () => {
    videoInput.click();
});

videoInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 10.5) {
                alert("Please select a video shorter than 10 seconds.");
                return;
            }
            startConversion();
        };
        video.src = URL.createObjectURL(file);
    }
});

function startConversion() {
    uploadSection.style.opacity = '0';
    
    setTimeout(() => {
        uploadSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        loadingSection.style.opacity = '1';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            progressFill.style.width = progress + '%';
            percentageText.innerText = progress + '%';

            if (progress >= 100) {
                clearInterval(interval);
                showResults();
            }
        }, 50); 
    }, 500);
}

function showResults() {
    loadingSection.style.opacity = '0';
    
    setTimeout(() => {
        loadingSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        resultSection.style.opacity = '1';
    }, 500);
}
