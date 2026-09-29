(function () {
  const track = document.getElementById('track');
  const slides = Array.from(track.querySelectorAll('.slide'));
  const dotsEl = document.getElementById('dots');
  const hint = document.getElementById('hint');
  const total = slides.length;
  let index = 0;
  let touching = false;
  let startX = 0;
  let startY = 0;
  let dx = 0;

  function parseHash() {
    const m = location.hash.match(/^#(\d+)/);
    if (m) {
      const n = parseInt(m[1], 10) - 1;
      if (n >= 0 && n < total) return n;
    }
    return 0;
  }

  function render() {
    track.style.transform = 'translate3d(' + (-index * 100) + '%,0,0)';
    if (dotsEl) {
      dotsEl.querySelectorAll('button').forEach(function (b, i) {
        b.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }
    const label = slides[index].getAttribute('data-label') || '';
    hint.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')
      + (label ? ' · ' + label : '');
    const hash = '#' + (index + 1);
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  function go(n) {
    index = Math.max(0, Math.min(total - 1, n));
    render();
  }

  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  if (dotsEl && total <= 10) {
    slides.forEach(function (_, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.addEventListener('click', function () { go(i); });
      dotsEl.appendChild(b);
    });
  } else if (dotsEl) {
    dotsEl.hidden = true;
  }

  document.getElementById('prevHit').addEventListener('click', prev);
  document.getElementById('nextHit').addEventListener('click', next);

  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault(); next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault(); prev();
    } else if (e.key === 'Home') {
      e.preventDefault(); go(0);
    } else if (e.key === 'End') {
      e.preventDefault(); go(total - 1);
    }
  });

  const root = document.getElementById('deck');
  root.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    touching = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dx = 0;
  }, { passive: true });

  root.addEventListener('touchmove', function (e) {
    if (!touching || e.touches.length !== 1) return;
    dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      track.style.transition = 'none';
      const offset = (-index * 100) + (dx / root.clientWidth * 100);
      track.style.transform = 'translate3d(' + offset + '%,0,0)';
    }
  }, { passive: true });

  root.addEventListener('touchend', function () {
    if (!touching) return;
    touching = false;
    track.style.transition = '';
    if (Math.abs(dx) > Math.min(64, root.clientWidth * 0.15)) {
      if (dx < 0) next(); else prev();
    } else {
      render();
    }
    dx = 0;
  });

  window.addEventListener('hashchange', function () { go(parseHash()); });
  window.addEventListener('resize', render);

  index = parseHash();
  render();
})();
