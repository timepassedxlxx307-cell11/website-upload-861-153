function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }
    callback();
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            "\"": "&quot;"
        }[char];
    });
}

function bindMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
        return;
    }
    toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
    });
}

function bindSearchForms() {
    document.querySelectorAll(".search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (!input || !input.value.trim()) {
                event.preventDefault();
                input && input.focus();
                return;
            }
            event.preventDefault();
            window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
        });
    });
}

function bindHero() {
    var slides = Array.from(document.querySelectorAll(".hero-slide"));
    var dots = Array.from(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
        return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === current);
        });
    }
    function start() {
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5600);
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            window.clearInterval(timer);
            show(index);
            start();
        });
    });
    start();
}

function bindRails() {
    document.querySelectorAll(".rail-wrap").forEach(function (wrap) {
        var rail = wrap.querySelector(".movie-rail");
        var prev = wrap.querySelector(".rail-prev");
        var next = wrap.querySelector(".rail-next");
        if (!rail) {
            return;
        }
        var amount = function () {
            return Math.max(260, Math.floor(rail.clientWidth * 0.8));
        };
        prev && prev.addEventListener("click", function () {
            rail.scrollBy({ left: -amount(), behavior: "smooth" });
        });
        next && next.addEventListener("click", function () {
            rail.scrollBy({ left: amount(), behavior: "smooth" });
        });
    });
}

function bindFilters() {
    var input = document.querySelector(".filter-input");
    if (!input) {
        return;
    }
    var cards = Array.from(document.querySelectorAll(".movie-card"));
    input.addEventListener("input", function () {
        var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        cards.forEach(function (card) {
            var haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.year,
                card.textContent
            ].join(" ").toLowerCase();
            var matched = words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
            card.style.display = matched ? "" : "none";
        });
    });
}

function movieCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card search-card\">" +
        "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\">" +
        "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"play-badge\">▶</span>" +
        "<span class=\"year-badge\">" + escapeHtml(item.year) + "</span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
        "<h2><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>" +
        "<p class=\"movie-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.type) + " · " + escapeHtml(item.genre) + "</p>" +
        "<p class=\"movie-line\">" + escapeHtml(item.oneLine) + "</p>" +
        "<div class=\"tag-list\">" + tags + "</div>" +
        "</div>" +
        "</article>";
}

function renderSearch() {
    var box = document.getElementById("search-results");
    if (!box || !window.MOVIES) {
        return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var formInput = document.querySelector(".search-page-form input[name='q']");
    if (formInput) {
        formInput.value = query;
    }
    if (!query) {
        box.innerHTML = "<div class=\"search-empty\">请输入关键词开始搜索。</div>";
        return;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.MOVIES.filter(function (item) {
        var haystack = [
            item.title,
            item.region,
            item.type,
            item.genre,
            item.year,
            item.oneLine,
            (item.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return words.every(function (word) {
            return haystack.indexOf(word) !== -1;
        });
    }).slice(0, 120);
    if (!results.length) {
        box.innerHTML = "<div class=\"search-empty\">没有找到匹配影片，请换一个关键词。</div>";
        return;
    }
    box.innerHTML = results.map(movieCard).join("");
}

ready(function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindRails();
    bindFilters();
    renderSearch();
});
