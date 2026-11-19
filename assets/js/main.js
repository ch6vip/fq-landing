/* 什锦铺 · single-page interactions */
(function () {
  "use strict";

  var root = document.documentElement;
  var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  var THEME_KEY = "fq-landing-theme";
  var MIRROR_KEY = "fq-landing-mirror";
  var PROXY_PREFIX = "https://gh-proxy.com/";

  /* ---------- Theme Toggle ---------- */
  function storedTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
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
    if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#0C0D10" : "#FFFFFF");
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

  /* ---------- Header Scroll State ---------- */
  var header = document.getElementById("site-header");
  var lastScrolled = null;
  function onScroll() {
    if (!header) return;
    var scrolled = window.scrollY > 8;
    if (scrolled !== lastScrolled) {
      header.classList.toggle("is-scrolled", scrolled);
      lastScrolled = scrolled;
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile Nav ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");

  function setNav(open) {
    if (!navToggle) return;
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  }

  if (navToggle && nav) {
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
  }

  /* ---------- Scroll Spy ---------- */
  if (nav && "IntersectionObserver" in window) {
    var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var spyTargets = navLinks
      .map(function (link) {
        var el = document.querySelector(link.getAttribute("href"));
        return el ? { link: link, el: el } : null;
      })
      .filter(Boolean);

    if (spyTargets.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var match = spyTargets.filter(function (t) { return t.el === entry.target; })[0];
          if (!match) return;
          if (!entry.isIntersecting) {
            match.link.classList.remove("is-current");
            match.link.removeAttribute("aria-current");
            return;
          }
          navLinks.forEach(function (l) {
            l.classList.remove("is-current");
            l.removeAttribute("aria-current");
          });
          match.link.classList.add("is-current");
          match.link.setAttribute("aria-current", "true");
        });
      }, { rootMargin: "-40% 0px -52% 0px", threshold: 0 });
      spyTargets.forEach(function (t) { spy.observe(t.el); });
    }
  }

  /* ---------- Progressive Reveal on Scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !motionPreference.matches && revealEls.length) {
    var vh = window.innerHeight || 800;
    var pending = [];
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top > vh * 0.94) {
        el.classList.add("will-reveal");
        pending.push(el);
      }
    });

    if (pending.length) {
      var revealer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          revealer.unobserve(el);
          el.classList.remove("will-reveal");
          el.classList.add("is-shown");
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });

      pending.forEach(function (el) { revealer.observe(el); });
    }
  }

  /* ---------- Reader Playground ---------- */
  var demo = document.getElementById("reader-demo");
  var demoMeta = document.getElementById("demo-meta");
  var swatches = Array.prototype.slice.call(document.querySelectorAll(".swatch"));
  var fontBtns = Array.prototype.slice.call(document.querySelectorAll("[data-demo-font]"));
  var sizeDownBtn = document.getElementById("demo-size-down");
  var sizeUpBtn = document.getElementById("demo-size-up");
  var fontSizes = [15, 17, 19, 21];
  var sizeIndex = 1;

  function applySwatch(btn) {
    if (!demo || !btn) return;
    var bg = btn.getAttribute("data-bg");
    var ink = btn.getAttribute("data-ink");
    var name = btn.getAttribute("data-name");
    demo.style.setProperty("--demo-bg", bg);
    demo.style.setProperty("--demo-ink", ink);
    demo.setAttribute("data-demo-dark", bg.toLowerCase() === "#151618" ? "true" : "false");
    if (demoMeta) demoMeta.textContent = name + " · " + bg.toUpperCase();
    swatches.forEach(function (s) {
      var active = s === btn;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  swatches.forEach(function (btn) {
    btn.addEventListener("click", function () { applySwatch(btn); });
  });
  var initSwatch = swatches.filter(function (s) { return s.classList.contains("is-active"); })[0];
  if (initSwatch) applySwatch(initSwatch);

  fontBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!demo) return;
      var mode = btn.getAttribute("data-demo-font");
      demo.style.setProperty("--demo-font", mode === "serif" ? "var(--reader-serif)" : "var(--sans)");
      fontBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
    });
  });

  function updateDemoSize() {
    if (!demo) return;
    demo.style.setProperty("--demo-size", fontSizes[sizeIndex] + "px");
    if (sizeDownBtn) sizeDownBtn.disabled = sizeIndex === 0;
    if (sizeUpBtn) sizeUpBtn.disabled = sizeIndex === fontSizes.length - 1;
  }

  if (sizeDownBtn && sizeUpBtn) {
    updateDemoSize();
    sizeDownBtn.addEventListener("click", function () {
      if (sizeIndex > 0) {
        sizeIndex -= 1;
        updateDemoSize();
      }
    });
    sizeUpBtn.addEventListener("click", function () {
      if (sizeIndex < fontSizes.length - 1) {
        sizeIndex += 1;
        updateDemoSize();
      }
    });
  }

  /* ---------- Appearance Switcher ---------- */
  var appearanceData = {
    light: {
      src: "assets/img/home-light.webp",
      alt: "浅色外观的什锦铺首页界面",
      chip: "经典浅色",
      title: "亮堂干净，白天一眼看清封面",
      desc: "纯净白底配珊瑚红点缀，排行榜、推荐流和封面书架清清楚楚。大太阳底下通勤刷几章，文字和封面都利落不发灰。",
      points: [
        "高对比白底与清晰封面网格，找书不费劲",
        "阅读进度小红标挂在封面上，追到哪一眼知道",
        "支持跟随系统日夜自动切换，不用天天手动调"
      ]
    },
    dark: {
      src: "assets/img/home-dark.webp",
      alt: "深色外观的什锦铺首页界面",
      chip: "夜间深色 · 支持 OLED 纯黑",
      title: "关灯窝在被窝里，柔和不晃眼",
      desc: "深灰背景配低刺眼文字，夜里刷书、看榜都舒服很多。用 OLED 屏幕的手机还能再打开纯黑模式，观感更沉也顺带省电。",
      points: [
        "深色界面大幅降低夜间屏幕刺眼感",
        "封面、文字与卡片依然保持清晰对比",
        "提供 OLED 纯黑选项，深夜刷书更省电"
      ]
    },
    eink: {
      src: "assets/img/home-eink.webp",
      alt: "墨水屏纯黑白外观的什锦铺首页界面",
      chip: "电纸书专调",
      title: "纯黑白、无动画，翻页像真纸一样利落",
      desc: "专门为墨水屏设备打磨的纯黑白模式：去掉毛玻璃、去掉花哨过渡动画，减少灰阶闪烁与残影，在电纸书上用着特别跟手。",
      points: [
        "纯白底色与纯黑字体，告别灰蒙蒙",
        "关闭毛玻璃与过渡动画，响应干脆不拖沓",
        "有效减少墨水屏残影，长时间看书更轻松"
      ]
    }
  };

  var segTabs = Array.prototype.slice.call(document.querySelectorAll(".seg-tab"));
  var appearanceImg = document.getElementById("appearance-img");
  var appearancePanel = document.getElementById("appearance-panel");
  var appearanceChip = document.getElementById("appearance-chip");
  var appearanceTitle = document.getElementById("appearance-title");
  var appearanceDesc = document.getElementById("appearance-desc");
  var appearancePoints = document.getElementById("appearance-points");
  var appearanceAnim = null;

  function selectAppearance(key, focusTab) {
    var data = appearanceData[key];
    if (!data || !appearanceImg) return;
    if (appearanceAnim) appearanceAnim.cancel();
    var changed = appearanceImg.getAttribute("src") !== data.src;

    segTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-appearance") === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });

    appearanceImg.srcset = data.src.replace(".webp", "-300.webp") + " 300w, " + data.src + " 600w";
    appearanceImg.src = data.src;
    appearanceImg.alt = data.alt;
    if (appearanceChip) appearanceChip.textContent = data.chip;
    if (appearanceTitle) appearanceTitle.textContent = data.title;
    if (appearanceDesc) appearanceDesc.textContent = data.desc;
    if (appearancePoints) {
      appearancePoints.innerHTML = data.points
        .map(function (text) { return "<li>" + text + "</li>"; })
        .join("");
    }
    var activeTab = segTabs.filter(function (t) { return t.classList.contains("is-active"); })[0];
    if (activeTab && appearancePanel) {
      appearancePanel.setAttribute("aria-labelledby", activeTab.id);
    }
    if (changed && !motionPreference.matches && appearanceImg.animate) {
      appearanceAnim = appearanceImg.animate(
        [{ opacity: 0.45 }, { opacity: 1 }],
        { duration: 200, easing: "ease-out" }
      );
    }
  }

  segTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      selectAppearance(tab.getAttribute("data-appearance"), false);
    });
  });

  var segBar = document.querySelector(".segmented");
  if (segTabs.length && segBar) {
    segBar.addEventListener("keydown", function (e) {
      var current = segTabs.findIndex(function (t) { return t.classList.contains("is-active"); });
      var next = null;
      if (e.key === "ArrowRight") next = (current + 1) % segTabs.length;
      if (e.key === "ArrowLeft") next = (current - 1 + segTabs.length) % segTabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = segTabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      selectAppearance(segTabs[next].getAttribute("data-appearance"), true);
    });
  }

  /* ---------- Download Mirror Switch ---------- */
  (function initDownloadMirror() {
    var mirrorBtns = Array.prototype.slice.call(document.querySelectorAll("[data-mirror]"));
    var dlLinks = Array.prototype.slice.call(document.querySelectorAll("a[data-download]"));
    var mirrorNote = document.getElementById("mirror-note");
    var heroMirrorLink = document.getElementById("hero-mirror-link");
    if (!mirrorBtns.length || !dlLinks.length) return;

    dlLinks.forEach(function (link) {
      link.setAttribute("data-origin-href", link.getAttribute("href"));
    });

    function storedMirror() {
      try {
        var saved = localStorage.getItem(MIRROR_KEY);
        if (saved === "proxy" || saved === "github") return saved;
      } catch (e) {}
      return "proxy";
    }

    function applyMirror(mode, persist) {
      var useProxy = mode === "proxy";
      dlLinks.forEach(function (link) {
        var origin = link.getAttribute("data-origin-href");
        if (!origin) return;
        link.setAttribute("href", useProxy ? PROXY_PREFIX + origin : origin);
      });
      mirrorBtns.forEach(function (btn) {
        var active = btn.getAttribute("data-mirror") === mode;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (mirrorNote) {
        mirrorNote.innerHTML = useProxy
          ? '当前使用第三方公益加速 <code>gh-proxy.com</code>（原始文件来自 GitHub Releases），如遇限速或打不开，可随时切回「GitHub 官方」。'
          : '当前直连 GitHub 官方 Releases；如果国内下载偏慢，可随时切换到「国内加速」。';
      }
      if (heroMirrorLink) {
        heroMirrorLink.innerHTML = useProxy
          ? '已默认开启国内加速 · 切换官方线路或看安装步骤 <span aria-hidden="true">↓</span>'
          : '当前直连 GitHub 官方 · 切换国内加速或看安装步骤 <span aria-hidden="true">↓</span>';
      }
      if (persist) {
        try { localStorage.setItem(MIRROR_KEY, mode); } catch (e) {}
      }
    }

    applyMirror(storedMirror(), false);

    mirrorBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = btn.getAttribute("data-mirror");
        applyMirror(next, true);
      });
    });
  })();

  /* ---------- OS Recommendation ---------- */
  (function detectPlatform() {
    var ua = navigator.userAgent || "";
    var plat = navigator.userAgentData && navigator.userAgentData.platform;
    var detected = null;
    if (plat === "Android" || /Android/i.test(ua)) detected = "android";
    else if (plat === "Windows" || /Windows NT/i.test(ua)) detected = "windows";
    if (!detected) return;

    var card = document.getElementById("dl-" + detected);
    var hint = document.getElementById("platform-hint");
    if (card) {
      card.classList.add("is-recommended");
      var badge = card.querySelector("[data-recommendation]");
      if (badge) badge.hidden = false;
    }
    if (hint) {
      hint.textContent = detected === "android"
        ? "检测到你正在用 Android 设备，直接选下方高亮的安卓安装包就行。"
        : "检测到你正在用 Windows 电脑，直接选下方高亮的 Windows 压缩包就行。";
    }

    if (detected === "windows") {
      var heroAndroid = document.querySelector('[data-hero-os="android"]');
      var heroWin = document.querySelector('[data-hero-os="windows"]');
      if (heroAndroid && heroWin) {
        heroWin.classList.remove("btn-secondary");
        heroWin.classList.add("btn-primary");
        heroAndroid.classList.remove("btn-primary");
        heroAndroid.classList.add("btn-secondary");
      }
    }
  })();

  /* ---------- FAQ Single-Open Accordion ---------- */
  var faqs = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  faqs.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqs.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Copy QQ Number ---------- */
  var copyBtn = document.getElementById("copy-qq");
  var qqNumber = document.getElementById("qq-number");
  var toast = document.getElementById("toast");
  var toastTimer = null;
  var copyLabelTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
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
        showToast("QQ 群号 " + text + " 已复制");
        var label = copyBtn.querySelector("span");
        if (label) {
          window.clearTimeout(copyLabelTimer);
          label.textContent = "已复制";
          copyLabelTimer = window.setTimeout(function () { label.textContent = "复制群号"; }, 1600);
        }
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {
          if (legacyCopy(text)) done();
          else showToast("复制失败，请手动选中群号复制");
        });
      } else if (legacyCopy(text)) {
        done();
      } else {
        showToast("复制失败，请手动选中群号复制");
      }
    });
  }
})();
