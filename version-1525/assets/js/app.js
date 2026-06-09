(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer;

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

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');
    var emptyResults = document.querySelector('[data-empty-results]');

    if (filterInput && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));

        filterInput.addEventListener('input', function () {
            var keyword = filterInput.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyResults) {
                emptyResults.classList.toggle('is-visible', visible === 0);
            }
        });
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage && typeof SEARCH_MOVIES !== 'undefined') {
        var searchForm = searchPage.querySelector('[data-search-form]');
        var searchInput = searchPage.querySelector('[data-search-query]');
        var searchResults = searchPage.querySelector('[data-search-results]');
        var searchEmpty = searchPage.querySelector('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function createResult(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="movie-card" data-card data-title="' + escapeHtml(movie.title) + '" data-tags="' + escapeHtml(movie.tags.join(' ')) + '">' +
                '<a class="movie-cover" href="' + movie.url + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
                    '<span class="movie-badge">' + escapeHtml(movie.type) + '</span>' +
                '</a>' +
                '<div class="movie-info">' +
                    '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-list">' + tags + '</div>' +
                '</div>' +
            '</article>';
        }

        function runSearch(query) {
            var keyword = query.trim().toLowerCase();
            var matches = SEARCH_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
                return !keyword || text.indexOf(keyword) !== -1;
            }).slice(0, 120);

            searchResults.innerHTML = matches.map(createResult).join('');
            searchEmpty.classList.toggle('is-visible', matches.length === 0);
        }

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var nextQuery = searchInput.value.trim();
                var nextUrl = nextQuery ? 'search.html?q=' + encodeURIComponent(nextQuery) : 'search.html';
                history.replaceState(null, '', nextUrl);
                runSearch(nextQuery);
            });
        }

        runSearch(initialQuery);
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    var playerStage = document.querySelector('[data-player-stage]');

    if (playerStage) {
        var video = playerStage.querySelector('video');
        var cover = playerStage.querySelector('[data-player-cover]');
        var stream = playerStage.getAttribute('data-stream');
        var hlsReady = false;

        function attachStream() {
            if (!video || !stream || hlsReady) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                hlsReady = true;
                return;
            }

            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(stream);
                hls.attachMedia(video);
                hlsReady = true;
                return;
            }

            video.src = stream;
            hlsReady = true;
        }

        function startVideo() {
            attachStream();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo();
                }
            });
        }
    }
})();
