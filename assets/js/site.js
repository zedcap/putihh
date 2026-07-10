/*
 * putihh.com: de-junk build glue.
 * Replaces the WPBakery/theme JS bundle (quarantined, malware-infected) with
 * clean, pinned upstream libraries: Swiper 11.2.6, Owl Carousel 2.3.4,
 * Magnific Popup 1.1.0, Isotope 3.0.6. No jQuery plugin here does anything
 * the WordPress build didn't already do on-page.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initSwipers();
    initOwlCarousels();
    initLightboxes();
    initIsotopeFilter();
    initParallaxBands();
    initBackToTop();
    initStickyHeader();
    initProgressBars();
    initProjectDetailToggle();
  });

  function initSwipers() {
    if (typeof Swiper === "undefined") return;
    document.querySelectorAll(".swiper").forEach(function (el) {
      var hasPagination = el.querySelector(".swiper-pagination");
      var hasNav = el.querySelector(".swiper-button-next");
      new Swiper(el, {
        effect: el.classList.contains("fadeslides") ? "fade" : "slide",
        fadeEffect: { crossFade: true },
        loop: true,
        keyboard: { enabled: el.classList.contains("keyboard") },
        autoplay:
          el.dataset.autoplay === "true"
            ? { delay: 5000, disableOnInteraction: false }
            : false,
        pagination: hasPagination
          ? { el: hasPagination, clickable: true }
          : false,
        navigation: hasNav
          ? {
              nextEl: el.querySelector(".swiper-button-next"),
              prevEl: el.querySelector(".swiper-button-prev"),
            }
          : false,
      });
    });
  }

  function initOwlCarousels() {
    if (typeof jQuery === "undefined" || !jQuery.fn.owlCarousel) return;
    jQuery(".brxy-carousel").each(function () {
      var $t = jQuery(this);
      $t.owlCarousel({
        loop: $t.data("loop") === true,
        items: parseInt($t.data("items"), 10) || 1,
        margin: parseInt($t.data("margin"), 10) || 0,
        nav: $t.data("nav") === true,
        dots: false,
      });
    });
  }

  function initLightboxes() {
    if (typeof jQuery === "undefined" || !jQuery.fn.magnificPopup) return;
    // Project detail sliders: each swiper's expand buttons form one gallery.
    jQuery(".brxy-full-wrap").each(function () {
      jQuery(this)
        .find(".brxy-expand-btn a")
        .magnificPopup({
          type: "image",
          gallery: { enabled: true },
          mainClass: "mfp-fade",
        });
    });
    // Invest page image galleries (masonry groups), one lightbox gallery
    // per .project-galleries block, same grouping as the source markup.
    jQuery(".project-galleries").each(function () {
      jQuery(this).magnificPopup({
        delegate: ".gallery-wrap",
        type: "image",
        gallery: { enabled: true },
        mainClass: "mfp-fade",
      });
    });
  }

  function initIsotopeFilter() {
    if (typeof jQuery === "undefined" || !jQuery.fn.isotope) return;
    var $grid = jQuery(".brxy-masonry").has(".masonry-item");
    if (!$grid.length) return;
    $grid.isotope({
      itemSelector: ".masonry-item",
      layoutMode: "fitRows",
    });
    jQuery(".filter-buttons .brxy-filter-menu a").on("click", function (e) {
      e.preventDefault();
      var filterValue = jQuery(this).attr("data-filter");
      $grid.isotope({ filter: filterValue });
      jQuery(this).addClass("active").siblings().removeClass("active");
    });
  }

  function initParallaxBands() {
    // The background-image itself ships inline in the HTML (eager, paints
    // immediately, no flash of the .brxy-overlay scrim colour while JS
    // loads). This function only handles the scroll-linked pan.
    var bands = document.querySelectorAll(".brxy-parallax-band");
    if (!bands.length) return;

    // Pan spans the band's whole time on screen: 0 at the instant its top
    // edge enters the viewport bottom, 1 at the instant its bottom edge
    // leaves the viewport top. A pure background-size:cover often leaves
    // near-zero vertical slack (a band's aspect ratio can land close to the
    // source image's), which reads as a near-static image over that long a
    // window. MIN_PAN_RATIO forces enough overflow, as a fraction of the
    // band's own height, for the creep to read as real motion; it only
    // takes over when cover's natural overflow falls short (desktop here
    // already clears it), so it never upscales more than needed. Read each
    // band's real natural image size once (same URL already loading as the
    // CSS background, so this is a cache hit, not a new request) and derive
    // both the size and the pan range from actual geometry.
    var MIN_PAN_RATIO = 0.35;
    var SAFETY = 2; // px; keeps subpixel rounding from ever exposing the scrim

    var naturalSize = new Map();
    bands.forEach(function (el) {
      var url = el.dataset.vcParallaxImage;
      if (!url) return;
      var probe = new Image();
      probe.onload = function () {
        naturalSize.set(el, { w: probe.naturalWidth, h: probe.naturalHeight });
        requestUpdate(); // size arrives after first paint; reposition once known
      };
      probe.src = url;
    });

    var vh = window.innerHeight || document.documentElement.clientHeight;

    var ticking = false;
    function update() {
      bands.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var maxOffset = 0;
        var size = naturalSize.get(el);
        if (size && rect.width && rect.height) {
          var coverScale = Math.max(rect.width / size.w, rect.height / size.h);
          var targetOverflow = rect.height * MIN_PAN_RATIO;
          var targetScale = (rect.height + 2 * (targetOverflow + SAFETY)) / size.h;
          var scale = Math.max(coverScale, targetScale);
          var scaledH = size.h * scale;
          el.style.backgroundSize = size.w * scale + "px " + scaledH + "px";
          maxOffset = Math.max(0, (scaledH - rect.height) / 2 - SAFETY);
        }
        // progress: 0 = top edge at viewport bottom, 1 = bottom edge at
        // viewport top. Clamped so scroll past either end holds the extreme.
        var progress = (vh - rect.top) / (vh + rect.height);
        progress = Math.max(0, Math.min(1, progress));
        var offset = maxOffset ? (progress * 2 - 1) * maxOffset : 0;
        el.style.backgroundPosition = "center calc(50% + " + offset + "px)";
      });
      ticking = false;
    }
    function requestUpdate() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        vh = window.innerHeight || document.documentElement.clientHeight;
        requestUpdate();
      },
      { passive: true }
    );
    update();
  }

  function initBackToTop() {
    var wrap = document.querySelector(".brxy-back-top");
    var btn = document.querySelector(".brxy-back-top a");
    if (!btn || !wrap) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    // Theme CSS hides .brxy-back-top by default (display:none) and expects
    // the old scripts.js to reveal it after the page has scrolled some.
    window.addEventListener(
      "scroll",
      function () {
        wrap.style.display = window.scrollY > 400 ? "block" : "none";
      },
      { passive: true }
    );
  }

  function initStickyHeader() {
    var header = document.querySelector(".brxy-header");
    if (!header) return;
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 80) {
          header.classList.add("is-sticky");
        } else {
          header.classList.remove("is-sticky");
        }
      },
      { passive: true }
    );
  }

  function initProjectDetailToggle() {
    // Project detail pages: the fact panel (title/description/prev-next/
    // "View Projects") sits translateX(420px) off-screen by theme CSS
    // until .brxy-sinlge-detail gets an .open class, originally toggled
    // by the quarantined scripts.js "Details" button handler.
    var wrap = document.querySelector(".brxy-sinlge-detail");
    var btn = document.querySelector(".brxy-info-btn a");
    if (!wrap || !btn) return;
    btn.addEventListener("click", function () {
      wrap.classList.toggle("open");
    });
  }

  function initProgressBars() {
    document.querySelectorAll(".progress-bar[data-percent]").forEach(
      function (el) {
        el.style.width = el.dataset.percent;
      }
    );
  }
})();
