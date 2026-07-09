/*
 * putihh.com — de-junk build glue.
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
    var bands = document.querySelectorAll("[data-vc-parallax-image]");
    if (!bands.length) return;
    bands.forEach(function (el) {
      el.classList.add("brxy-parallax-band");
      el.style.backgroundImage = "url(" + el.dataset.vcParallaxImage + ")";
    });
    var ticking = false;
    function update() {
      bands.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var speed = parseFloat(el.dataset.vcParallax) || 0.2;
        var offset = rect.top * speed * -1;
        el.style.backgroundPosition = "center calc(50% + " + offset + "px)";
      });
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
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
    // until .brxy-sinlge-detail gets an .open class — originally toggled
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
