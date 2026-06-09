(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var sliders = document.querySelectorAll('[data-slider]');
  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    if (!slides.length) return;
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  });

  var filterInput = document.querySelector('[data-filter-input]');
  if (filterInput) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));
    filterInput.addEventListener('input', function () {
      var q = filterInput.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '')).toLowerCase();
        item.style.display = !q || text.indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }

  var results = document.querySelector('[data-search-results]');
  if (results && window.SEARCH_INDEX) {
    var params = new URLSearchParams(location.search);
    var query = (params.get('q') || '').trim();
    var box = document.querySelector('[data-search-box]');
    if (box) box.value = query;
    var normalized = query.toLowerCase();
    var matches = window.SEARCH_INDEX.filter(function (item) {
      var text = (item.title + ' ' + item.meta + ' ' + item.tags + ' ' + item.desc).toLowerCase();
      return !normalized || text.indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (!matches.length) {
      results.innerHTML = '<div class="search-results-empty">没有找到相关影片</div>';
    } else {
      results.innerHTML = matches.map(function (item) {
        return '<article class="movie-card movie-card-compact">' +
          '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(item.year || '高清') + '</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
          '<p class="card-meta">' + escapeHtml(item.meta) + '</p>' +
          '<p class="card-desc">' + escapeHtml(item.desc) + '</p>' +
          '<div class="card-tags"><span>' + escapeHtml(item.category) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }
})();
