(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = qs('.mobile-toggle');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            button.setAttribute('aria-expanded', String(open));
        });
    }

    function setupSearchForms() {
        qsa('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function setupHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var index = 0;
        var timer;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function setupLocalFilter() {
        qsa('[data-local-filter]').forEach(function (form) {
            var input = qs('[data-local-filter-input]', form);
            var list = qs('[data-local-filter-list]');
            if (!input || !list) {
                return;
            }
            input.addEventListener('input', function () {
                var keyword = normalize(input.value);
                qsa('.movie-card', list).forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-keywords')
                    ].join(' '));
                    card.hidden = keyword && text.indexOf(keyword) === -1;
                });
            });
        });
    }

    function setupSearchPage() {
        var page = qs('[data-search-page]');
        if (!page) {
            return;
        }
        var input = qs('[data-search-input]', page);
        var region = qs('[data-region-filter]', page);
        var type = qs('[data-type-filter]', page);
        var year = qs('[data-year-filter]', page);
        var list = qs('[data-search-list]', page);
        var empty = qs('[data-empty-state]', page);
        var params = new URLSearchParams(window.location.search);
        if (input && params.get('q')) {
            input.value = params.get('q');
        }
        function apply() {
            var keyword = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;
            qsa('.movie-card', list).forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-keywords')
                ].join(' '));
                var match = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    match = false;
                }
                if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
                    match = false;
                }
                if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
                    match = false;
                }
                if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                    match = false;
                }
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        [input, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupPlayer() {
        var root = qs('[data-video-url]');
        var video = qs('#movie-video');
        var overlay = qs('.play-overlay');
        if (!root || !video || !overlay) {
            return;
        }
        var url = root.getAttribute('data-video-url');
        var loaded = false;
        var hlsInstance = null;
        function load() {
            if (loaded || !url) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function play() {
            load();
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }
        overlay.addEventListener('click', play);
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                overlay.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupLocalFilter();
        setupSearchPage();
        setupPlayer();
    });
}());
