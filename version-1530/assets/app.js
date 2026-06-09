(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
        menuButton.textContent = mobileMenu.classList.contains('is-open') ? '×' : '☰';
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 6200);
    }

    var filterRoot = document.querySelector('[data-filter-form]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty]');

    if (filterRoot && cards.length) {
      var textInput = filterRoot.querySelector('[name="q"]');
      var yearSelect = filterRoot.querySelector('[name="year"]');
      var typeSelect = filterRoot.querySelector('[name="type"]');
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');

      if (initialQuery && textInput) {
        textInput.value = initialQuery;
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function updateCards() {
        var query = normalize(textInput ? textInput.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.year
          ].join(' '));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchYear = !year || normalize(card.dataset.year) === year;
          var matchType = !type || normalize(card.dataset.type) === type;
          var visible = matchQuery && matchYear && matchType;

          card.hidden = !visible;
          if (visible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      }

      [textInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', updateCards);
          control.addEventListener('change', updateCards);
        }
      });

      updateCards();
    }
  });
})();
