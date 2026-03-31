/* ============================================================
   CLEAR CREEK BUILDERS — script.js
   Pass 3: Modular JS — nav, menu, modal, stats, reveal, faq, lightbox
============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     LUCIDE ICONS INIT
  ---------------------------------------------------------- */
  function initIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIcons, { once: true });
  } else {
    initIcons();
  }

  /* ----------------------------------------------------------
     UTILITY
  ---------------------------------------------------------- */
  const qs  = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     YEAR
  ---------------------------------------------------------- */
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------
     MOBILE MENU
  ---------------------------------------------------------- */
  const hamburger   = qs('.hamburger');
  const menuOverlay = qs('#menu-overlay');

  function openMenu() {
    hamburger.classList.add('active');
    menuOverlay.classList.add('open');
    menuOverlay.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    menuOverlay.classList.remove('open');
    menuOverlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
  }

  hamburger.addEventListener('click', () =>
    hamburger.classList.contains('active') ? closeMenu() : openMenu()
  );

  // Close on nav link click
  qsa('a', menuOverlay).forEach(a => a.addEventListener('click', closeMenu));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ----------------------------------------------------------
     MODAL
  ---------------------------------------------------------- */
  const modalOverlay = qs('#modal-overlay');

  function openModal() {
    modalOverlay.removeAttribute('hidden');
    document.body.classList.add('modal-open');
    qs('.modal-close', modalOverlay).focus();
  }

  function closeModal() {
    modalOverlay.setAttribute('hidden', '');
    document.body.classList.remove('modal-open');
  }

  // All CTA buttons open modal
  qsa('.js-modal-open').forEach(btn =>
    btn.addEventListener('click', openModal)
  );

  // Close button
  qs('.modal-close').addEventListener('click', closeModal);

  // Overlay click closes
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  // Escape closes
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modalOverlay.hasAttribute('hidden')) closeModal();
  });

  /* ----------------------------------------------------------
     FORM VALIDATION — shared for modal + footer forms
  ---------------------------------------------------------- */
  function validateForm(form) {
    let valid = true;

    qsa('[required]', form).forEach(field => {
      const err = field.nextElementSibling;
      const empty = !field.value.trim();
      const badEmail = field.type === 'email' && field.value && !/\S+@\S+\.\S+/.test(field.value);
      const msg = empty ? 'This field is required.' : badEmail ? 'Enter a valid email address.' : '';

      field.classList.toggle('invalid', !!(empty || badEmail));
      if (err && err.classList.contains('field-error')) err.textContent = msg;
      if (empty || badEmail) valid = false;
    });

    return valid;
  }

  qsa('form').forEach(form => {
    form.addEventListener('submit', e => {
      if (!validateForm(form)) e.preventDefault();
    });

    // Clear error on input
    qsa('[required]', form).forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('invalid');
        const err = field.nextElementSibling;
        if (err && err.classList.contains('field-error')) err.textContent = '';
      });
    });
  });

  /* ----------------------------------------------------------
     STATS COUNTER
  ---------------------------------------------------------- */
  const stats = qsa('.stat');

  function animateStat(numEl, target) {
    if (prefersReducedMotion() || target === 0) return;
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      numEl.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else numEl.textContent = target;
    }

    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const numEl = qs('.stat-num', entry.target);
      const target = parseInt(numEl.dataset.target, 10);
      if (!isNaN(target) && target > 0) animateStat(numEl, target);
      statsObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  stats.forEach(s => statsObserver.observe(s));

  /* ----------------------------------------------------------
     SCROLL REVEAL
  ---------------------------------------------------------- */
  if (!prefersReducedMotion()) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    qsa('.reveal-item').forEach(el => revealObserver.observe(el));
  } else {
    // Skip animation — show immediately
    qsa('.reveal-item').forEach(el => el.classList.add('revealed'));
  }

  /* ----------------------------------------------------------
     FAQ ACCORDION
  ---------------------------------------------------------- */
  qsa('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.closest('.faq-item').querySelector('.faq-a');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      qsa('.faq-q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const a = b.closest('.faq-item').querySelector('.faq-a');
        a.style.maxHeight = '0';
        a.classList.remove('open');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ----------------------------------------------------------
     LIGHTBOX
  ---------------------------------------------------------- */
  const lightbox   = qs('#lightbox');
  const lbImg      = qs('#lightbox-img');
  const lbClose    = qs('.lightbox-close');
  const lbPrev     = qs('.lightbox-prev');
  const lbNext     = qs('.lightbox-next');
  const bentoItems = qsa('.bento-item');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const img = bentoItems[index].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lightbox.removeAttribute('hidden');
    document.body.classList.add('modal-open');
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    document.body.classList.remove('modal-open');
    lbImg.src = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + bentoItems.length) % bentoItems.length;
    const img = bentoItems[currentIndex].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % bentoItems.length;
    const img = bentoItems[currentIndex].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
  }

  bentoItems.forEach((item, i) =>
    item.addEventListener('click', () => openLightbox(i))
  );

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  // Close on overlay click
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === qs('.lightbox-img-wrap')) closeLightbox();
  });

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showPrev();
    if (e.key === 'ArrowRight')  showNext();
  });

  // Pointer/swipe for lightbox
  let pointerStartX = 0;

  lightbox.addEventListener('pointerdown', e => {
    pointerStartX = e.clientX;
  });

  lightbox.addEventListener('pointerup', e => {
    const delta = e.clientX - pointerStartX;
    if (Math.abs(delta) < 50) return;
    delta < 0 ? showNext() : showPrev();
  });

  /* ----------------------------------------------------------
     SMOOTH SCROLL — anchor links
  ---------------------------------------------------------- */
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 16;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: prefersReducedMotion() ? 'instant' : 'smooth'
      });
    });
  });

})();
