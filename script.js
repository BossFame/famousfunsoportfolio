(function () {
  'use strict';

  // Mark JS as active so the CSS fallback (native cursor, no custom dot) stands down.
  document.documentElement.classList.add('js-ready');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initCustomCursor();
    initScrollProgress();
    initNav();
    initReveals();
    initSkillBars();
    initTestimonialCarousel();
    initDragScroll();
    initLightbox();
    initCvModal();
    initBackToTop();
    initContactForm();
  });

  /* ============================================================
     PRELOADER
     ============================================================ */
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    var countEl = document.getElementById('pre-count');
    if (!preloader) return;

    var pct = 0;
    var duration = prefersReducedMotion ? 300 : 1800;
    var start = null;

    function tick(ts) {
      if (start === null) start = ts;
      var elapsed = ts - start;
      pct = Math.min(100, Math.round((elapsed / duration) * 100));
      if (countEl) countEl.textContent = pct + '%';
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        finish();
      }
    }

    function finish() {
      preloader.classList.add('fade-out');
      window.setTimeout(function () {
        preloader.setAttribute('hidden', '');
      }, 750);
    }

    requestAnimationFrame(tick);

    // Safety net: never let the preloader trap a visitor if something above stalls.
    window.setTimeout(finish, duration + 1200);
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  function initCustomCursor() {
    var dot = document.getElementById('cursor');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring || isCoarsePointer) return;

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    document.addEventListener('mousedown', function () { ring.style.width = '30px'; ring.style.height = '30px'; });
    document.addEventListener('mouseup', function () { ring.style.width = '38px'; ring.style.height = '38px'; });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    var interactive = 'a, button, input, textarea, .h-scroll-item, [data-open-cv]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(interactive)) {
        ring.style.opacity = '1';
        dot.style.transform = 'translate(-50%,-50%) scale(1.4)';
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(interactive)) {
        ring.style.opacity = '0.6';
        dot.style.transform = 'translate(-50%,-50%) scale(1)';
      }
    });
  }

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ============================================================
     NAV: active link tracking, mobile menu, theme toggle
     ============================================================ */
  function initNav() {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a.nav-link'));
    var sections = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (sections.length && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = '#' + entry.target.id;
            navLinks.forEach(function (a) {
              a.classList.toggle('active', a.getAttribute('href') === id);
            });
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(function (s) { observer.observe(s); });
    }

    // Mobile hamburger menu
    var hamburger = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
      function closeMobile() {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
      function openMobile() {
        mobileMenu.classList.add('open');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
      hamburger.addEventListener('click', function () {
        if (mobileMenu.classList.contains('open')) closeMobile(); else openMobile();
      });
      mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMobile);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMobile();
      });
      window.closeMobile = closeMobile;
    }

    // Theme toggle
    var themeToggle = document.getElementById('theme-toggle');
    var root = document.documentElement;
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    function setTheme(theme) {
      root.setAttribute('data-theme', theme);
      var icon = themeToggle ? themeToggle.querySelector('i') : null;
      if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
      if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#050505' : '#f7f5f2');
    }
    if (themeToggle) {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      themeToggle.addEventListener('click', function () {
        var current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  }

  /* ============================================================
     SCROLL REVEALS
     ============================================================ */
  function initReveals() {
    var targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ============================================================
     SKILL BARS
     ============================================================ */
  function initSkillBars() {
    var section = document.getElementById('skills');
    var fills = document.querySelectorAll('.skill-fill');
    if (!section || !fills.length) return;

    function fill() {
      fills.forEach(function (el) {
        var pct = el.getAttribute('data-pct') || '0';
        el.style.width = pct + '%';
      });
    }

    if (!('IntersectionObserver' in window)) { fill(); return; }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fill();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }

  /* ============================================================
     TESTIMONIALS CAROUSEL
     ============================================================ */
  function initTestimonialCarousel() {
    var track = document.getElementById('testimonials-track');
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    if (!track || !prevBtn || !nextBtn) return;

    var cards = track.children;
    var index = 0;

    function perView() {
      return window.innerWidth <= 900 ? 1 : 2;
    }

    function maxIndex() {
      return Math.max(0, cards.length - perView());
    }

    function update() {
      if (!cards.length) return;
      var card = cards[0];
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || '0') || 0;
      var cardWidth = card.getBoundingClientRect().width + gap;
      track.style.transform = 'translateX(-' + (index * cardWidth) + 'px)';
    }

    prevBtn.addEventListener('click', function () {
      index = index <= 0 ? maxIndex() : index - 1;
      update();
    });
    nextBtn.addEventListener('click', function () {
      index = index >= maxIndex() ? 0 : index + 1;
      update();
    });
    window.addEventListener('resize', function () {
      index = Math.min(index, maxIndex());
      update();
    });

    update();
  }

  /* ============================================================
     DRAG-TO-SCROLL FOR HORIZONTAL GALLERIES
     ============================================================ */
  function initDragScroll() {
    var scrollers = document.querySelectorAll('.h-scroll');
    scrollers.forEach(function (scroller) {
      var isDown = false;
      var startX = 0;
      var startScroll = 0;
      var moved = false;

      scroller.addEventListener('mousedown', function (e) {
        isDown = true;
        moved = false;
        startX = e.pageX;
        startScroll = scroller.scrollLeft;
      });
      window.addEventListener('mouseup', function () { isDown = false; });
      window.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        var delta = e.pageX - startX;
        if (Math.abs(delta) > 4) moved = true;
        scroller.scrollLeft = startScroll - delta;
      });
      // Prevent the click-through to the lightbox when the user was dragging, not clicking.
      scroller.addEventListener('click', function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    });
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    var img = lightbox.querySelector('.lightbox-image');
    var zoom = 1;

    function open(src, alt) {
      img.src = src;
      img.alt = alt || '';
      zoom = 1;
      lightbox.style.setProperty('--zoom', zoom);
      lightbox.removeAttribute('hidden');
      requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
      document.body.classList.add('lightbox-open');
    }
    function close() {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
      window.setTimeout(function () {
        lightbox.setAttribute('hidden', '');
        img.src = '';
      }, 250);
    }

    document.querySelectorAll('.h-scroll-item img').forEach(function (image) {
      image.style.cursor = isCoarsePointer ? 'auto' : 'pointer';
      image.addEventListener('click', function () {
        open(image.currentSrc || image.src, image.alt);
      });
    });

    lightbox.querySelectorAll('[data-close-lightbox]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
    });

    lightbox.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-action');
        if (action === 'zoom-in') zoom = Math.min(3, zoom + 0.25);
        else if (action === 'zoom-out') zoom = Math.max(1, zoom - 0.25);
        else zoom = 1;
        lightbox.style.setProperty('--zoom', zoom);
      });
    });
  }

  /* ============================================================
     CV MODAL
     ============================================================ */
  function initCvModal() {
    var modal = document.getElementById('cv-modal');
    if (!modal) return;

    function open() {
      modal.removeAttribute('hidden');
      requestAnimationFrame(function () { modal.classList.add('is-open'); });
      document.body.style.overflow = 'hidden';
    }
    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      window.setTimeout(function () { modal.setAttribute('hidden', ''); }, 250);
    }

    document.querySelectorAll('[data-open-cv]').forEach(function (btn) {
      btn.addEventListener('click', open);
    });
    modal.querySelectorAll('[data-close-cv]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  function initBackToTop() {
    var btn = document.getElementById('back-top');
    if (!btn) return;
    function toggle() {
      btn.classList.toggle('visible', window.scrollY > 480);
    }
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
    toggle();
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    var fallback = document.getElementById('form-fallback');
    var fallbackText = document.getElementById('form-fallback-text');
    var copyBtn = document.getElementById('form-copy-btn');
    if (!form) return;

    var DEST_EMAIL = 'famousfunso@gmail.com';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var name = form.querySelector('#cf-name').value.trim();
      var email = form.querySelector('#cf-email').value.trim();
      var service = form.querySelector('#cf-service').value.trim();
      var message = form.querySelector('#cf-message').value.trim();

      var subjectRaw = 'Project Inquiry' + (service ? ': ' + service : '');
      var bodyRaw =
        'Name: ' + name + '\nEmail: ' + email + (service ? '\nService: ' + service : '') + '\n\n' + message;

      var mailto =
        'mailto:' + DEST_EMAIL +
        '?subject=' + encodeURIComponent(subjectRaw) +
        '&body=' + encodeURIComponent(bodyRaw);

      // A temporary, invisible link + a real click() opens the mail client more
      // reliably across browsers than assigning window.location.href directly.
      var link = document.createElement('a');
      link.href = mailto;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (status) {
        status.textContent = 'Opening your email app… if nothing happens in a few seconds, use the copy option below.';
      }

      // There is no reliable way to detect whether a mail client actually opened,
      // so always surface a manual fallback right away rather than leaving the
      // visitor stuck if their device has no mail app configured.
      if (fallback && fallbackText) {
        fallbackText.value = 'To: ' + DEST_EMAIL + '\nSubject: ' + subjectRaw + '\n\n' + bodyRaw;
        fallback.hidden = false;
      }
    });

    if (copyBtn && fallbackText) {
      copyBtn.addEventListener('click', function () {
        var restoreLabel = copyBtn.innerHTML;
        function done(success) {
          copyBtn.innerHTML = success
            ? '<i class="fa-solid fa-check"></i> Copied'
            : '<i class="fa-solid fa-xmark"></i> Copy failed — select text manually';
          copyBtn.classList.toggle('form-copy-btn-done', success);
          window.setTimeout(function () {
            copyBtn.innerHTML = restoreLabel;
            copyBtn.classList.remove('form-copy-btn-done');
          }, 2200);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(fallbackText.value).then(
            function () { done(true); },
            function () { fallbackText.select(); done(false); }
          );
        } else {
          fallbackText.select();
          try {
            document.execCommand('copy');
            done(true);
          } catch (err) {
            done(false);
          }
        }
      });
    }
  }
})();