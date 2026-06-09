(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === activeIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === activeIndex);
    });
  }

  function restartTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5000);
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        restartTimer();
      });
    }

    restartTimer();
  }

  var searchInput = document.getElementById('movieSearch');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.catalog-grid .movie-card'));

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', function () {
      var value = searchInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = ((card.dataset.title || '') + ' ' + (card.dataset.meta || '')).toLowerCase();
        card.style.display = !value || haystack.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  }

  window.setupMoviePlayer = function (streamUrl) {
    var video = document.querySelector('.js-player');
    var trigger = document.querySelector('.js-play');
    var ready = false;
    var hls = null;

    if (!video || !trigger || !streamUrl) {
      return;
    }

    function play() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function attach() {
      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.controls = true;
        ready = true;
      }

      trigger.classList.add('is-hidden');
      play();
    }

    trigger.addEventListener('click', attach);
    video.addEventListener('click', function () {
      if (!ready) {
        attach();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
