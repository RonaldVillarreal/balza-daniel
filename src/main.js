import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
// en mobile la barra del navegador cambia el alto al scrollear; sin esto ScrollTrigger recalcula y las animaciones saltan
ScrollTrigger.config({ ignoreMobileResize: true });

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.body.classList.add('is-loading');
$('.js-year').textContent = new Date().getFullYear();

/* ---------------------------------------------------------
   Smooth scroll (Lenis) sincronizado con ScrollTrigger
   En touch se mantiene el scroll nativo (mejor en mobile).
--------------------------------------------------------- */
const lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4) });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

/* ---------------------------------------------------------
   Video del hero: si no existe el archivo, queda la foto
   con movimiento de cámara (dolly) como fallback.
--------------------------------------------------------- */
const video = $('.hero__video');
const sources = $$('source', video);
let failed = 0;
sources.forEach((s) =>
  s.addEventListener('error', () => {
    failed++;
    if (failed === sources.length) video.classList.add('is-missing');
  })
);

/* ---------------------------------------------------------
   Preloader
--------------------------------------------------------- */
function preloader() {
  return new Promise((resolve) => {
    const counter = { v: 0 };
    const tl = gsap.timeline({ onComplete: resolve });
    tl.to('.loader__mark path', { strokeDashoffset: 0, duration: 1.6, stagger: 0.25, ease: 'power2.inOut' }, 0)
      .to(counter, {
        v: 100, duration: 2, ease: 'power3.inOut',
        onUpdate: () => ($('.js-count').textContent = Math.round(counter.v)),
      }, 0)
      .to('.loader__mark, .loader__count, .loader__label', { opacity: 0, duration: 0.4 }, '+=0.15')
      .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
      .set('.loader', { display: 'none' });
    if (reduced) tl.progress(1);
  });
}

/* ---------------------------------------------------------
   Intro del hero
--------------------------------------------------------- */
function heroIntro() {
  gsap.timeline()
    .from('.hero__fallback, .hero__video', { scale: 1.4, duration: 2.4, ease: 'expo.out' }, 0)
    .from('.hero__title .line > span', { yPercent: 110, duration: 1.4, stagger: 0.12, ease: 'expo.out' }, 0.1)
    .from('.hero__lead, .hero__scroll, .hero__coords, .header', { opacity: 0, y: 20, duration: 1, stagger: 0.08, ease: 'power3.out' }, 0.6);
}

/* ---------------------------------------------------------
   Scroll del hero: el render se recoge en una "ventana"
   con arco y el título sube.
--------------------------------------------------------- */
function heroScroll() {
  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 769px)', mob: '(max-width: 768px)' }, (ctx) => {
    const { desk } = ctx.conditions;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 1 },
    });
    tl.to('.hero__media', {
      clipPath: desk ? 'inset(14% 24% 6% 24% round 340px 340px 6px 6px)' : 'inset(16% 8% 10% 8% round 200px 200px 6px 6px)',
      ease: 'none',
    }, 0)
      .to('.hero__title .line:nth-child(1)', { xPercent: desk ? -18 : -8, ease: 'none' }, 0)
      .to('.hero__title .line:nth-child(2)', { xPercent: desk ? 14 : 8, ease: 'none' }, 0)
      .to('.hero__title .line:nth-child(3)', { xPercent: desk ? -6 : -4, ease: 'none' }, 0)
      .to('.hero__bottom', { opacity: 0, y: -30, ease: 'none' }, 0)
      .to('.hero__shade', { opacity: 0.4, ease: 'none' }, 0);
  });
}

/* ---------------------------------------------------------
   Manifiesto: palabras que se encienden con el scroll
--------------------------------------------------------- */
function manifesto() {
  const el = $('.js-words');
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  gsap.to($$('.w', el), {
    opacity: 1, stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
}

/* ---------------------------------------------------------
   Proyectos: horizontal en desktop, reveals en mobile
--------------------------------------------------------- */
function projects() {
  const mm = gsap.matchMedia();
  const track = $('.work__track');

  mm.add('(min-width: 769px)', () => {
    const distance = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: '.work', start: 'top top', end: () => `+=${distance()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    // parallax interno de cada imagen mientras se desplaza
    $$('.project__img img').forEach((img) => {
      gsap.fromTo(img, { xPercent: -8 }, {
        xPercent: 8, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      });
    });
  });

  mm.add('(max-width: 768px)', () => {
    $$('.project').forEach((p) => {
      gsap.fromTo($('.project__img', p), { clipPath: 'inset(18% 10% 18% 10%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 90%', end: 'top 35%', scrub: true },
      });
      gsap.fromTo($('img', p), { scale: 1.3 }, {
        scale: 1.05, ease: 'none', force3D: true,
        scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });
}

/* ---------------------------------------------------------
   Banda: la ventana con arco se abre hasta pantalla completa
--------------------------------------------------------- */
function revealBand() {
  // El arco mantiene su forma todo el recorrido: el radio es "infinito" (el navegador lo
  // limita a medio ancho), y solo cambian los recortes. Se calcula en px relativo a la
  // pantalla porque el marco es más grande que el viewport.
  const frame = $('.reveal-band__frame');
  const ease = gsap.parseEase('power1.inOut');
  const state = { p: 0 };
  const setClip = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const mob = vw <= 768;
    const offX = (frame.offsetWidth - vw) / 2;
    const offY = frame.offsetHeight - vh;
    const k = 1 - ease(state.p);
    // al final el recorte llega a los bordes del marco (fuera de pantalla), así las curvas no se ven
    const top = (offY + vh * (mob ? 0.32 : 0.3)) * k;
    const side = (offX + vw * (mob ? 0.18 : 0.32)) * k;
    const bottom = vh * (mob ? 0.32 : 0.3) * k;
    frame.style.clipPath = `inset(${top}px ${side}px ${bottom}px ${side}px round 9999px 9999px 4px 4px)`;
  };
  setClip();
  ScrollTrigger.addEventListener('refresh', setClip);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.reveal-band', start: 'top top', end: 'bottom bottom', scrub: 1 },
  });
  tl.to(state, { p: 1, ease: 'none', onUpdate: setClip }, 0)
    .to('.reveal-band__frame img', { scale: 1, ease: 'none' }, 0)
    .fromTo('.reveal-band__text span', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.1, ease: 'power2.out', duration: 0.4 }, 0.15);
}

/* ---------------------------------------------------------
   Servicios: tarjetas apiladas que se achican al taparse
--------------------------------------------------------- */
function services() {
  const cards = $$('.card');
  cards.forEach((card, i) => {
    card.style.setProperty('--i', i);
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.92, filter: 'brightness(.55)', ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
    });
  });
}

/* ---------------------------------------------------------
   Contadores, proceso, estudio, títulos
--------------------------------------------------------- */
function details() {
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    const suf = el.dataset.suffix || '';
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v) + suf) }),
    });
  });

  gsap.to('.process__list', {
    ease: 'none',
    scrollTrigger: {
      trigger: '.process__list', start: 'top 80%', end: 'bottom 50%', scrub: true,
      onUpdate: (st) => $$('.process__list li').forEach((li, i, arr) => {
        const p = gsap.utils.clamp(0, 1, st.progress * arr.length - i);
        li.style.setProperty('--p', p);
      }),
    },
  });
  gsap.from('.process__list li', {
    y: 40, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.process__list', start: 'top 80%' },
  });

  gsap.fromTo('.studio__img img', { scale: 1.25, yPercent: -6 }, {
    scale: 1, yPercent: 6, ease: 'none',
    scrollTrigger: { trigger: '.studio', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.from('.studio__img', {
    clipPath: 'inset(100% 0% 0% 0% round 300px 300px 4px 4px)', duration: 1.6, ease: 'expo.out',
    scrollTrigger: { trigger: '.studio', start: 'top 70%' },
  });

  gsap.from('.contact__title .line > span', {
    yPercent: 110, stagger: 0.12, duration: 1.3, ease: 'expo.out',
    scrollTrigger: { trigger: '.contact', start: 'top 70%' },
  });

  $$('.h2').forEach((h) =>
    gsap.from(h, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } })
  );

  gsap.fromTo('.footer__big', { yPercent: 40 }, {
    yPercent: 0, ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });
}

/* ---------------------------------------------------------
   Cursor personalizado (solo con mouse)
--------------------------------------------------------- */
function cursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const c = $('.cursor');
  const x = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
  const y = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('mousemove', (e) => { x(e.clientX); y(e.clientY); });
  $$('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => c.classList.add('is-view'));
    el.addEventListener('mouseleave', () => c.classList.remove('is-view'));
  });
}

/* ---------------------------------------------------------
   Menú y navegación
--------------------------------------------------------- */
function nav() {
  const burger = $('.burger');
  const menu = $('.menu');
  let open = false;
  const toggle = (state = !open) => {
    open = state;
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    if (open) {
      lenis.stop();
      gsap.set(menu, { visibility: 'visible' });
      gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' });
      gsap.fromTo('.menu__list a', { yPercent: 100 }, { yPercent: 0, stagger: 0.06, duration: 1, ease: 'expo.out', delay: 0.35 });
    } else {
      lenis.start();
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'expo.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
    }
  };
  burger.addEventListener('click', () => toggle());

  // header: fondo sólido al bajar, se oculta al scrollear hacia abajo y vuelve al subir
  const header = $('.header');
  let lastY = 0;
  lenis.on('scroll', ({ scroll }) => {
    header.classList.toggle('is-scrolled', scroll > 60);
    header.classList.toggle('is-hidden', !open && scroll > 200 && scroll > lastY);
    lastY = scroll;
  });

  $$('[data-link]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id.startsWith('#')) return;
      e.preventDefault();
      if (open) toggle(false);
      lenis.scrollTo(id === '#top' ? 0 : id, { duration: 1.6 });
    })
  );
}

/* ---------------------------------------------------------
   Init
--------------------------------------------------------- */
nav();
cursor();

window.addEventListener('load', () => ScrollTrigger.refresh());

preloader().then(() => {
  document.body.classList.remove('is-loading');
  lenis.start();
  heroIntro();
  heroScroll();
  manifesto();
  projects();
  revealBand();
  services();
  details();
  ScrollTrigger.refresh();
});
