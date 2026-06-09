function formatTime(value) {
    if (!Number.isFinite(value) || value <= 0) {
        return "0:00";
    }
    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60).toString().padStart(2, "0");
    return minutes + ":" + seconds;
}

function mountPlayer(videoUrl) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var playButton = document.querySelector(".play-toggle");
    var muteButton = document.querySelector(".mute-toggle");
    var fullscreenButton = document.querySelector(".fullscreen-toggle");
    var progress = document.querySelector(".video-progress");
    var progressFill = document.querySelector(".video-progress-fill");
    var progressDot = document.querySelector(".video-progress-dot");
    var time = document.querySelector(".video-time");
    var hls = null;
    var attached = false;

    if (!video || !videoUrl) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function start() {
        attach();
        cover && cover.classList.add("hidden");
        var request = video.play();
        if (request && typeof request.catch === "function") {
            request.catch(function () {});
        }
    }

    function toggle() {
        if (video.paused) {
            start();
            return;
        }
        video.pause();
    }

    function update() {
        var duration = video.duration || 0;
        var current = video.currentTime || 0;
        var percent = duration ? Math.min(100, Math.max(0, current / duration * 100)) : 0;
        if (progressFill) {
            progressFill.style.width = percent + "%";
        }
        if (progressDot) {
            progressDot.style.left = percent + "%";
        }
        if (time) {
            time.textContent = formatTime(current) + " / " + formatTime(duration);
        }
    }

    cover && cover.addEventListener("click", start);
    playButton && playButton.addEventListener("click", toggle);
    video.addEventListener("click", toggle);
    video.addEventListener("play", function () {
        cover && cover.classList.add("hidden");
        if (playButton) {
            playButton.textContent = "暂停";
        }
    });
    video.addEventListener("pause", function () {
        if (playButton) {
            playButton.textContent = "播放";
        }
    });
    video.addEventListener("timeupdate", update);
    video.addEventListener("durationchange", update);
    video.addEventListener("loadedmetadata", update);

    muteButton && muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "静音" : "音量";
    });

    fullscreenButton && fullscreenButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            return;
        }
        if (video.requestFullscreen) {
            video.requestFullscreen();
        }
    });

    progress && progress.addEventListener("click", function (event) {
        attach();
        var rect = progress.getBoundingClientRect();
        var ratio = (event.clientX - rect.left) / rect.width;
        if (video.duration) {
            video.currentTime = Math.min(video.duration, Math.max(0, ratio * video.duration));
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

window.mountPlayer = mountPlayer;
