(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    var search = document.querySelector("[data-header-search]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      if (search) {
        search.classList.toggle("is-open");
      }
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });
    show(0);
    play();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var query = panel.querySelector("[data-filter-query]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty]");

    function matchCard(card) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      var queryValue = query ? query.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      if (queryValue && text.indexOf(queryValue) === -1) {
        return false;
      }
      if (typeValue && card.getAttribute("data-type") !== typeValue) {
        return false;
      }
      if (yearValue && card.getAttribute("data-year") !== yearValue) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matchCard(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [query, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initSearchPage() {
    var resultNode = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!resultNode || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      resultNode.innerHTML = '<div class="empty-state is-visible">请输入片名、地区、年份或题材。</div>';
      return;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.SITE_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
      return words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    if (!results.length) {
      resultNode.innerHTML = '<div class="empty-state is-visible">暂无匹配内容，换个关键词试试。</div>';
      return;
    }
    resultNode.innerHTML = '<div class="movie-grid">' + results.map(function (movie) {
      return [
        '<article class="movie-card">',
        '<a href="' + movie.href + '">',
        '<div class="poster-wrap">',
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '">',
        '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
        '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
        '</div>',
        '<div class="card-body">',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p class="line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="meta-row">',
        '<span class="meta-pill">' + escapeHtml(movie.region) + '</span>',
        '<span class="meta-pill">' + escapeHtml(movie.genre) + '</span>',
        '</div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }).join('') + '</div>';
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-play]");
      var stream = player.getAttribute("data-stream");
      var hls = null;
      var loaded = false;
      if (!video || !cover || !stream) {
        return;
      }

      function start() {
        cover.classList.add("is-hidden");
        if (!loaded) {
          loaded = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
        }
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {});
        }
      }

      cover.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
