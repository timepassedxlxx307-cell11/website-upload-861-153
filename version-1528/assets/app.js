(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileNav() {
        var button = document.querySelector("[data-mobile-menu]");
        var nav = document.querySelector("[data-site-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSliders() {
        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var thumbs = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-thumb]"));
            if (slides.length <= 1) {
                return;
            }
            var active = 0;
            var timer = null;
            function activate(index) {
                active = index;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                thumbs.forEach(function (thumb, i) {
                    thumb.classList.toggle("is-active", i === active);
                });
            }
            function next() {
                activate((active + 1) % slides.length);
            }
            thumbs.forEach(function (thumb, index) {
                thumb.addEventListener("click", function () {
                    activate(index);
                    window.clearInterval(timer);
                    timer = window.setInterval(next, 6500);
                });
            });
            timer = window.setInterval(next, 6500);
        });
    }

    function initLocalFilters() {
        document.querySelectorAll("[data-local-filter]").forEach(function (input) {
            var section = input.closest(".filter-section") || document;
            var items = Array.prototype.slice.call(section.querySelectorAll("[data-filter-text]"));
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                items.forEach(function (item) {
                    var haystack = (item.getAttribute("data-filter-text") || "").toLowerCase();
                    item.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
                });
            });
        });
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"movie-cover\" href=\"./" + escapeHtml(movie.url) + "\">" +
                    "<img src=\"./" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"play-badge\">▶</span>" +
                    "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<h3><a href=\"./" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p class=\"movie-meta\">" + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(" · ")) + "</p>" +
                    "<p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"tag-row\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var results = document.querySelector("[data-search-results]");
        if (!results || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-input]");
        var title = document.querySelector("[data-search-title]");
        var summary = document.querySelector("[data-search-summary]");
        if (input) {
            input.value = query;
        }
        var list = window.MOVIE_INDEX;
        if (query) {
            var q = query.toLowerCase();
            list = list.filter(function (movie) {
                var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
                return haystack.indexOf(q) !== -1;
            });
            if (title) {
                title.textContent = "搜索结果";
            }
            if (summary) {
                summary.textContent = list.length ? "已为你筛选相关影片" : "没有找到匹配影片";
            }
        }
        if (!query) {
            list = list.slice(0, 60);
        }
        results.innerHTML = list.slice(0, 240).map(cardHtml).join("");
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            var loaded = false;
            var hls = null;
            function load() {
                if (loaded) {
                    return;
                }
                var url = video.getAttribute("data-video") || "";
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
                loaded = true;
            }
            function play() {
                load();
                shell.classList.add("is-playing");
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        shell.classList.remove("is-playing");
                    });
                }
            }
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (!loaded) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            video.addEventListener("ended", function () {
                shell.classList.remove("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileNav();
        initHeroSliders();
        initLocalFilters();
        initSearchPage();
        initPlayers();
    });
})();
