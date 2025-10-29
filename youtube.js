document.addEventListener('DOMContentLoaded', () => {
    const youtubeForm = document.getElementById('youtube-form');
    const loadingBarWrapper = document.querySelector('.loading-bar-wrapper');
    const loadingBar = document.querySelector('.loading-bar');
    const loadingPercent = document.querySelector('.loading-percent');
    const conversionSection = document.querySelector('.conversion-section');
    const youtubePlayer = document.getElementById('youtube-player');
    const downloadBtn = document.querySelector('.download-btn');

    youtubeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const youtubeUrl = document.getElementById('youtube-url').value;
        const videoId = getYouTubeID(youtubeUrl);

        if (!videoId) {
            alert("Please enter a valid YouTube URL.");
            return;
        }

        youtubeForm.style.display = 'none';
        loadingBarWrapper.style.display = 'block';

        let currentPercent = 0;
        const estimatedTime = 3000;
        const intervalStepTime = estimatedTime / 100;

        const loadingInterval = setInterval(() => {
            currentPercent++;
            loadingBar.style.width = `${currentPercent}%`;
            loadingPercent.textContent = `${currentPercent}%`;
            if (currentPercent >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    loadingBarWrapper.style.display = 'none';
                    conversionSection.style.display = 'flex';
                    conversionSection.style.opacity = '1';
                    youtubePlayer.src = `https://www.youtube.com/embed/${videoId}`;
                    youtubePlayer.dataset.videoId = videoId;
                }, 500);
            }
        }, intervalStepTime);
    });

    downloadBtn.addEventListener('click', () => {
        const videoId = youtubePlayer.dataset.videoId;
        if (!videoId) {
            alert("Please submit a video link first.");
            return;
        }

        const formatSelect = document.getElementById('convert-select').value;
        const qualitySelect = document.getElementById('quality-select').value;
        const audioQualitySelect = document.getElementById('audio-quality-select').value;
        const fileName = `youtube-${videoId}-${qualitySelect}-${audioQualitySelect}.${formatSelect}`;

        const a = document.createElement('a');
        a.href = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    function getYouTubeID(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
});
