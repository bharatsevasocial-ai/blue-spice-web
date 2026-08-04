/* ============================================================
   Blue Spice Web Studio — interactions
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 900px)');

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- sticky nav ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  var setMenu = function (open) {
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
  });
  desktop.addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- hero word rotator ----------
     Cross-fades stacked words and animates the container width to match.
     No overflow clipping involved, so the compositor can't paint two at once. */
  var rot = document.getElementById('rotator');
  if (rot) {
    var words = [].slice.call(rot.children);

    var fit = function () {
      var on = rot.querySelector('.is-on') || words[0];
      rot.style.width = on.offsetWidth + 'px';
    };

    // width has to be set before the first paint or the headline reflows visibly
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    if (!reduced && words.length > 1) {
      var i = 0;
      setInterval(function () {
        words[i].classList.remove('is-on');
        i = (i + 1) % words.length;
        words[i].classList.add('is-on');
        fit();
      }, 2400);
    }
  }

  /* ---------- scroll reveals + counters + gauge ---------- */
  var countUp = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (reduced) { el.textContent = target; return; }
    var start = performance.now();
    var dur = 1400;
    var tick = function (now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  var revealables = document.querySelectorAll('.reveal');

  var show = function (el) {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    el.querySelectorAll('[data-count]').forEach(countUp);
  };

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });

    // Failsafe: if the observer never fires (background tab, odd engine),
    // nothing must stay invisible. Reveal everything after 2.5s.
    setTimeout(function () {
      if (document.querySelectorAll('.reveal.is-in').length) return;
      revealables.forEach(show);
    }, 2500);
  } else {
    revealables.forEach(show);
  }

  /* ---------- floating hero mockups (parallax) ---------- */
  var floats = document.querySelectorAll('[data-float]');
  if (floats.length && !reduced) {
    var mx = 0, my = 0, cx = 0, cy = 0, sy = 0, raf = null;

    var loop = function () {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      floats.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-float'));
        var base = el.classList.contains('mock--a') ? -4
                 : el.classList.contains('mock--b') ? 5
                 : -8;
        var tx = cx * d * 8;
        var ty = cy * d * 8 - sy * d * 0.05;
        el.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) rotate(' + base + 'deg)';
      });
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    window.addEventListener('scroll', function () {
      sy = window.scrollY;
    }, { passive: true });

    if (desktop.matches) raf = requestAnimationFrame(loop);
    desktop.addEventListener('change', function (e) {
      if (e.matches && !raf) { raf = requestAnimationFrame(loop); }
      else if (!e.matches && raf) {
        cancelAnimationFrame(raf); raf = null;
        floats.forEach(function (el) { el.style.transform = ''; });
      }
    });
  }

  /* ---------- magnetic buttons + custom cursor (desktop) ---------- */
  if (desktop.matches && !reduced) {
    var cursor = document.querySelector('.cursor');
    var cxp = 0, cyp = 0, tx = 0, ty = 0;

    document.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('is-on');
    }, { passive: true });

    // slower lerp so the ring trails the pointer instead of sticking to it
    (function cursorLoop() {
      cxp += (tx - cxp) * 0.14;
      cyp += (ty - cyp) * 0.14;
      var r = cursor.offsetWidth / 2;
      cursor.style.transform = 'translate3d(' + (cxp - r) + 'px,' + (cyp - r) + 'px,0)';
      requestAnimationFrame(cursorLoop);
    })();

    document.querySelectorAll('a, button, summary, .card, .plan').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cursor.classList.add('is-big'); });
      el.addEventListener('pointerleave', function () { cursor.classList.remove('is-big'); });
    });

    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.3 + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- FAQ: one open at a time ---------- */
  var qas = document.querySelectorAll('.qa');
  qas.forEach(function (qa) {
    qa.addEventListener('toggle', function () {
      if (!qa.open) return;
      qas.forEach(function (other) { if (other !== qa) other.open = false; });
    });
  });

  /* ---------- lead form → WhatsApp handoff ---------- */
  var WHATSAPP = '919388599000';
  var form = document.getElementById('leadForm');
  var note = document.getElementById('formNote');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var type = form.type.value;
    var msg = form.message.value.trim();

    var bad = false;
    [['name', name], ['phone', phone]].forEach(function (pair) {
      var field = form[pair[0]];
      var empty = pair[1].length < 2;
      field.classList.toggle('is-bad', empty);
      if (empty) bad = true;
    });

    if (bad) {
      note.textContent = 'Please add your name and phone number so we can get back to you.';
      form.querySelector('.is-bad').focus();
      return;
    }

    var text =
      'Hi Blue Spice Web Studio!\n\n' +
      'Name: ' + name + '\n' +
      'Phone: ' + phone + '\n' +
      'Looking for: ' + type +
      (msg ? '\n\nAbout my business: ' + msg : '');

    note.textContent = 'Opening WhatsApp…';
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');

    setTimeout(function () {
      note.textContent = 'Sent. If WhatsApp did not open, call us on +91 93885 99000.';
    }, 900);
  });

  form.addEventListener('input', function (e) {
    e.target.classList.remove('is-bad');
  });
})();
