/* 什锦铺 · landing interactions */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var THEME_KEY = "fq-landing-theme";

  /* ---------- Theme ---------- */
  function storedTheme() {
    try {
      var value = localStorage.getItem(THEME_KEY);
      if (value === "light" || value === "dark") return value;
    } catch (e) {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", theme === "dark" ? "切换到浅色外观" : "切换到深色外观");
    });
    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#151517" : "#F4F3EF");
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    }
  }

  applyTheme(storedTheme(), false);

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  });

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("site-header");
  var lastScrolled = null;
  function onScroll() {
    var scrolled = window.scrollY > 8;
    if (scrolled !== lastScrolled) {
      header.classList.toggle("is-scrolled", scrolled);
      lastScrolled = scrolled;
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");

  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  }

  navToggle.addEventListener("click", function () {
    setNav(!document.body.classList.contains("nav-open"));
  });
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setNav(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
      setNav(false);
      navToggle.focus();
    }
  });
  document.addEventListener("click", function (e) {
    if (!document.body.classList.contains("nav-open")) return;
    if (nav.contains(e.target) || navToggle.contains(e.target)) return;
    setNav(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) setNav(false);
  });
  if (window.matchMedia("(min-width: 861px)").matches) {
    /* no-op: desktop nav is visible by CSS */
  }

  /* ---------- Scroll spy ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var spyTargets = navLinks
    .map(function (link) {
      var el = document.querySelector(link.getAttribute("href"));
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && spyTargets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.remove("is-current");
          l.removeAttribute("aria-current");
        });
        var match = spyTargets.filter(function (t) { return t.el === entry.target; })[0];
        if (match) {
          match.link.classList.add("is-current");
          match.link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    spyTargets.forEach(function (t) { spy.observe(t.el); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revealFired = false;
    var revealer = new IntersectionObserver(function (entries) {
      revealFired = true;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { revealer.observe(el); });
    /* Last-resort net: only if the observer never delivered a single entry. */
    window.setTimeout(function () {
      if (!revealFired) {
        revealEls.forEach(function (el) { el.classList.add("in"); });
      }
    }, 2600);
  }

  /* ---------- Appearance tabs ---------- */
  var appearanceData = {
    light: {
      src: "assets/img/home-light.webp",
      alt: "浅色外观的什锦铺首页",
      label: "01 / LIGHT",
      title: "浅色 · 日间",
      desc: "白底、红字与封面网格。排行榜、推荐流和封面书架一眼看清，白天阅读干净不刺眼。",
      points: ["白色画布与红色强调色", "封面书架，进度角标一眼可见", "跟随系统，也能手动切换"]
    },
    dark: {
      src: "assets/img/home-dark.webp",
      alt: "深色外观的什锦铺首页",
      label: "02 / DARK",
      title: "深色 · 夜间",
      desc: "深灰底、柔和文字，夜里把光留给自己。封面与卡片在深色背景上依然清楚。",
      points: ["深色界面，降低夜间亮度", "文字与卡片保持足够对比", "OLED 纯黑可进一步省电"]
    },
    eink: {
      src: "assets/img/home-eink.webp",
      alt: "墨水屏外观的什锦铺首页",
      label: "03 / INK",
      title: "墨水屏 · 纯黑白",
      desc: "纯黑白、无毛玻璃、无过渡动画，减少墨水屏的量化灰阶和残影。翻页即换，不拖泥带水。",
      points: ["纯白底、纯黑字", "无毛玻璃、无过渡动画", "减少墨水屏残影"]
    }
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var appearanceImg = document.getElementById("appearance-img");
  var appearancePanel = document.getElementById("appearance-panel");
  var appearanceTitle = document.getElementById("appearance-title");
  var appearanceDesc = document.getElementById("appearance-desc");
  var appearancePoints = document.getElementById("appearance-points");
  var appearanceLabel = document.getElementById("appearance-label-text");
  var appearanceFrame = appearanceImg ? appearanceImg.closest(".phone") : null;
  var tabSwapTimer = null;

  /* Pre-decode all three screens so switching is instant. */
  Object.keys(appearanceData).forEach(function (key) {
    var img = new Image();
    img.src = appearanceData[key].src;
    if (img.decode) img.decode().catch(function () {});
  });

  function selectAppearance(key, focusTab) {
    var data = appearanceData[key];
    if (!data || !appearanceImg) return;

    tabs.forEach(function (tab) {
      var active = tab.getAttribute("data-appearance") === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });

    if (appearanceImg.getAttribute("src") !== data.src && !reduceMotion) {
      appearanceFrame.classList.add("is-swapping");
      window.clearTimeout(tabSwapTimer);
      tabSwapTimer = window.setTimeout(function () {
        applyAppearanceContent(data);
        appearanceFrame.classList.remove("is-swapping");
      }, 180);
    } else {
      applyAppearanceContent(data);
    }
  }

  function applyAppearanceContent(data) {
    appearanceImg.src = data.src;
    appearanceImg.alt = data.alt;
    appearanceTitle.textContent = data.title;
    appearanceDesc.textContent = data.desc;
    appearanceLabel.textContent = data.label;
    appearancePoints.innerHTML = data.points
      .map(function (p) { return "<li>" + p + "</li>"; })
      .join("");
    var activeTab = tabs.filter(function (t) { return t.classList.contains("is-active"); })[0];
    if (activeTab && appearancePanel) {
      appearancePanel.setAttribute("aria-labelledby", activeTab.id);
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      selectAppearance(tab.getAttribute("data-appearance"), false);
    });
  });

  var tabList = document.querySelector(".tabs");
  if (tabs.length && tabList) {
    tabList.addEventListener("keydown", function (e) {
      var current = tabs.findIndex(function (t) { return t.classList.contains("is-active"); });
      var next = null;
      if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      selectAppearance(tabs[next].getAttribute("data-appearance"), true);
    });
  }

  /* ---------- Reader demo swatches ---------- */
  var demo = document.getElementById("reader-demo");
  var demoMeta = document.getElementById("demo-meta");
  var demoText = document.getElementById("demo-text");
  var swatches = Array.prototype.slice.call(document.querySelectorAll(".swatch"));

  function applyPreset(btn) {
    if (!demo || !btn) return;
    var bg = btn.getAttribute("data-bg");
    var ink = btn.getAttribute("data-ink");
    var name = btn.getAttribute("data-name");
    demo.style.background = bg;
    demo.style.setProperty("--demo-ink", ink);
    demo.style.setProperty("--demo-bg", bg);
    if (demoMeta) demoMeta.textContent = name + " · " + bg.toUpperCase();
    if (demoText) demoText.style.color = ink;
    swatches.forEach(function (s) {
      var active = s === btn;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  swatches.forEach(function (btn) {
    btn.addEventListener("click", function () { applyPreset(btn); });
  });
  var initialSwatch = swatches.filter(function (s) { return s.classList.contains("is-active"); })[0];
  if (initialSwatch) applyPreset(initialSwatch);

  /* ---------- Copy QQ number ---------- */
  var copyBtn = document.getElementById("copy-qq");
  var qqNumber = document.getElementById("qq-number");
  var toast = document.getElementById("toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function legacyCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(area);
    return ok;
  }

  if (copyBtn && qqNumber) {
    copyBtn.addEventListener("click", function () {
      var text = qqNumber.textContent.trim();
      var done = function () {
        showToast("群号 " + text + " 已复制");
        var label = copyBtn.querySelector("span");
        if (label) {
          var old = label.textContent;
          label.textContent = "已复制";
          window.setTimeout(function () { label.textContent = old; }, 1600);
        }
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {
          if (legacyCopy(text)) done();
          else showToast("复制失败，请手动选择群号");
        });
      } else if (legacyCopy(text)) {
        done();
      } else {
        showToast("复制失败，请手动选择群号");
      }
    });
  }

  /* ---------- FAQ: close others, keep one open ---------- */
  var faqs = Array.prototype.slice.call(document.querySelectorAll(".faq"));
  faqs.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqs.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Anchor offset for sticky header ---------- */
  document.querySelectorAll("main [id]").forEach(function (el) {
    el.style.scrollMarginTop = "86px";
  });
})();
