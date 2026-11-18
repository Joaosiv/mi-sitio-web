const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.navlinks');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
menuButton.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

const quoteForm = document.getElementById('quote-form');
if (quoteForm) quoteForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const clean = key => String(data.get(key) || '').trim();
  const lines = [
    'Hola, deseo solicitar una cotización.',
    `Nombre / Empresa: ${clean('name')}`,
    `Teléfono: ${clean('phone')}`,
    `Correo: ${clean('email') || 'No indicado'}`,
    `Servicio: ${clean('service')}`,
    `Detalle: ${clean('message')}`
  ];
  const url = `https://wa.me/59177714619?text=${encodeURIComponent(lines.join('\n'))}`;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = url; // si el navegador bloquea la ventana emergente
});

// Aparición progresiva al entrar en pantalla.
const revealTargets = document.querySelectorAll('.company-heading,.company-feature,.purpose-grid article,.history-copy,.timeline li,.areas-head,.area,.service,.gallery-heading,.process-heading,.process-grid article,.contactgrid,.clients-heading,.clients-marquee,.proj-marquee,.proj-static,.proj-group-head');
const staggered = '.purpose-grid article,.timeline li,.area,.service,.process-grid article';
revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  if (el.matches(staggered)) el.style.transitionDelay = `${(i % 4) * 70}ms`;
});
function show(el) {
  el.classList.add('is-visible');
  // quita el retraso después de aparecer para que el hover no se sienta lento
  if (el.style.transitionDelay) setTimeout(() => { el.style.transitionDelay = ''; }, 1000);
}
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => { if (entry.isIntersecting) { show(entry.target); obs.unobserve(entry.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(show);
}

// Video del hero: versión liviana en móvil, sin video si el usuario ahorra datos o prefiere menos movimiento,
// y pausa automática cuando el hero no está visible.
(function () {
  const video = document.getElementById('hero-video');
  if (!video) return;
  const saveData = navigator.connection && navigator.connection.saveData;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conn = navigator.connection || {};
  const slow = /(^|-)(2g|3g)$/.test(conn.effectiveType || '') || (conn.downlink && conn.downlink < 1.5);
  if (saveData || reduced || slow) { video.remove(); return; } // conexión lenta: solo la imagen de portada
  if (window.matchMedia('(max-width: 700px)').matches) {
    video.querySelector('source').src = 'assets/video/hero-silos-movil.mp4';
    video.load();
  }
  const play = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
  play();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting ? play() : video.pause()), { threshold: 0.05 })
      .observe(document.getElementById('inicio'));
  }
})();

// Puntero tipo AutoCAD: retícula de líneas guía y coordenadas del cursor.
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const box = document.createElement('div');
  box.className = 'cad-guides';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<i class="gx"></i><i class="gy"></i><i class="cad-snap"><b></b></i><b class="cad-xy"></b>';
  document.body.appendChild(box);
  const snap = box.querySelector('.cad-snap'), gx = box.querySelector('.gx'), gy = box.querySelector('.gy'), xy = box.querySelector('.cad-xy');
  let x = 0, y = 0, queued = false;
  function paint() {
    queued = false;
    snap.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    gx.style.transform = 'translateY(' + y + 'px)';
    gy.style.transform = 'translateX(' + x + 'px)';
    const flipX = x > window.innerWidth - 150, flipY = y > window.innerHeight - 50;
    xy.style.transform = 'translate(' + (flipX ? x - 140 : x + 24) + 'px,' + (flipY ? y - 34 : y + 24) + 'px)';
    xy.textContent = 'X ' + x.toFixed(0) + '  Y ' + (y + window.scrollY).toFixed(0);
  }
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    x = e.clientX; y = e.clientY;
    const onField = !!(e.target.closest && e.target.closest('input,textarea'));
    box.classList.toggle('on', !onField);
    box.classList.toggle('snap', !!(e.target.closest && e.target.closest('a,button,.btn,select,label,summary,.client,.project,.service,.area,.purpose-grid article,.social-link')));
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => box.classList.remove('on'));
})();

// Números con efecto de contador (se activa al aparecer y al pasar el mouse).
(function () {
  const nums = document.querySelectorAll('.fx-num');
  if (!nums.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function run(el) {
    const n = +el.dataset.n || 0, t0 = performance.now(), dur = 650;
    clearInterval(el._t);
    el._t = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      const v = p < 1 ? Math.floor(Math.random() * 90) : n;
      el.textContent = String(p < 1 ? Math.max(v, 0) : n).padStart(2, '0');
      if (p >= 1) clearInterval(el._t);
    }, 45);
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } }), { threshold: .6 });
    nums.forEach(el => io.observe(el));
  }
  nums.forEach(el => { const box = el.closest('.service,.area,.process-grid article'); if (box) box.addEventListener('mouseenter', () => run(el)); });
})();

// Google Fonts sin bloquear la carga: se pide después de pintar la página; si falla, quedan las fuentes de respaldo.
(function () {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800;900&family=Manrope:wght@400..800&display=swap';
  const add = () => document.head.appendChild(l);
  if ('requestIdleCallback' in window) requestIdleCallback(add, { timeout: 1500 }); else setTimeout(add, 300);
})();
