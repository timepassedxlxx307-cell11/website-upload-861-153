(function () {
  window.initMoviePlayer = function (videoId, source) {
    var video = document.getElementById(videoId);
    if (!video) return;
    var shell = video.closest('.player-shell');
    var button = shell ? shell.querySelector('.player-play') : null;
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function start() {
      load();
      if (shell) shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) promise.catch(function () {});
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (shell) shell.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      if (shell) shell.classList.remove('is-playing');
    });
  };
})();
