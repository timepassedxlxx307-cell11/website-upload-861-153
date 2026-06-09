(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
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
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupCatalog() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-catalog-controls]"));
        blocks.forEach(function (block) {
            var section = block.closest(".catalog-section") || document;
            var input = block.querySelector("[data-search-input]");
            var filters = Array.prototype.slice.call(block.querySelectorAll("[data-filter]"));
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
            var empty = block.querySelector("[data-empty-state]");

            function run() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                var values = {};
                filters.forEach(function (filter) {
                    values[filter.getAttribute("data-filter")] = filter.value;
                });
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    Object.keys(values).forEach(function (field) {
                        if (!values[field]) {
                            return;
                        }
                        if ((card.getAttribute("data-" + field) || "") !== values[field]) {
                            ok = false;
                        }
                    });
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", run);
            }
            filters.forEach(function (filter) {
                filter.addEventListener("change", run);
            });
        });
    }

    window.attachMoviePlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var button = document.getElementById(config.buttonId);
        var stream = config.stream;
        var loaded = false;
        var hls = null;

        if (!video || !stream) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            loaded = true;
        }

        function start() {
            load();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
        video.addEventListener("ended", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
                hls = null;
                loaded = false;
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupCatalog();
    });
}());
