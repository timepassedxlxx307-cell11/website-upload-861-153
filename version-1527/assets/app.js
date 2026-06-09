(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    qsa('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var previous = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initImages() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      }, { once: true });
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video[data-stream]', player);
      var button = qs('[data-play-button]', player);
      var hls = null;
      var attached = false;

      function attach() {
        if (!video || attached) {
          return;
        }
        var stream = video.getAttribute('data-stream');
        if (!stream) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          attached = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          attached = true;
          return;
        }
        video.src = stream;
        attached = true;
      }

      function play() {
        attach();
        if (button) {
          button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (!video) {
        return;
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 && button) {
          button.classList.remove('is-hidden');
        }
      });

      video.addEventListener('emptied', function () {
        if (hls) {
          hls.destroy();
          hls = null;
          attached = false;
        }
      });
    });
  }

  function buildCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="poster-frame" href="./' + escapeHtml(item.file) + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(item.type) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
      '<h2><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h2>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var form = qs('[data-filter-form]');
    var results = qs('[data-search-results]');
    var status = qs('[data-search-status]');
    if (!form || !results || !status || !window.catalogItems) {
      return;
    }

    function readQuery() {
      var params = new URLSearchParams(window.location.search);
      ['q', 'region', 'type', 'year'].forEach(function (name) {
        var field = form.elements[name];
        if (field && params.get(name)) {
          field.value = params.get(name);
        }
      });
    }

    function apply(updateUrl) {
      var q = (form.elements.q.value || '').trim().toLowerCase();
      var region = form.elements.region.value;
      var type = form.elements.type.value;
      var year = form.elements.year.value;
      var filtered = window.catalogItems.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase();
        return (!q || text.indexOf(q) !== -1) &&
          (!region || item.region === region) &&
          (!type || item.type === type) &&
          (!year || item.year === year);
      }).slice(0, 96);

      results.innerHTML = filtered.map(buildCard).join('');
      status.textContent = filtered.length ? '已找到相关影视内容' : '未找到匹配内容';
      initImages();

      if (updateUrl) {
        var params = new URLSearchParams();
        if (q) {
          params.set('q', form.elements.q.value.trim());
        }
        if (region) {
          params.set('region', region);
        }
        if (type) {
          params.set('type', type);
        }
        if (year) {
          params.set('year', year);
        }
        var query = params.toString();
        history.replaceState(null, '', query ? './search.html?' + query : './search.html');
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply(true);
    });

    qsa('select', form).forEach(function (select) {
      select.addEventListener('change', function () {
        apply(true);
      });
    });

    readQuery();
    if (window.location.search) {
      apply(false);
    }
  }

  ready(function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initImages();
    initPlayers();
    initSearchPage();
  });
})();
