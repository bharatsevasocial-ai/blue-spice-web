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
     One <b> in the DOM whose text is swapped. The container reserves the width
     of the WIDEST word, so the headline's line length is identical no matter
     which word is showing and can never reflow onto another line mid-cycle. */
  var rot = document.getElementById('rotator');
  if (rot) {
    var word = rot.querySelector('b');
    var list = (rot.getAttribute('data-words') || word.textContent).split('|');

    // Measure every word and reserve the widest. Re-run on resize and once the
    // webfont lands, because both change the metrics.
    var reserve = function () {
      var original = word.textContent;
      rot.style.minWidth = '0px';
      var max = 0;
      for (var n = 0; n < list.length; n++) {
        word.textContent = list[n];
        if (word.offsetWidth > max) max = word.offsetWidth;
      }
      word.textContent = original;
      // ceil avoids a sub-pixel shortfall tipping the line over
      rot.style.minWidth = Math.ceil(max) + 1 + 'px';
    };

    reserve();
    window.addEventListener('resize', reserve);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserve);

    if (!reduced && list.length > 1) {
      var i = 0;
      setInterval(function () {
        i = (i + 1) % list.length;
        rot.classList.add('is-swapping');
        setTimeout(function () {
          word.textContent = list[i];
          rot.classList.remove('is-swapping');
        }, 220);
      }, 2600);
    }
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
