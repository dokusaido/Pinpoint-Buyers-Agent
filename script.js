(function () {
  'use strict';

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Scroll-triggered reveals (IntersectionObserver — no scroll listener)
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Sticky-nav state (rAF-throttled, passive)
  const nav = document.getElementById('nav');
  let ticking = false;
  function updateNav() {
    if (window.scrollY > 32) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
  }, { passive: true });

  // Mobile menu toggle
  const toggle = document.querySelector('.nav__toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('.nav__links a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth in-page navigation with sticky-nav offset + focus management
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  // Front-end form validation (no submission)
  const form = document.getElementById('enquiry-form');
  if (form) {
    const success = form.querySelector('.form__success');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      let firstInvalid = null;

      form.querySelectorAll('input, select, textarea').forEach((el) => {
        el.classList.remove('field-error');
        const value = (el.value || '').trim();
        const isEmail = el.type === 'email';
        const required = el.required;

        if (required && !value) { el.classList.add('field-error'); valid = false; }
        else if (isEmail && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          el.classList.add('field-error'); valid = false;
        }
        if (!valid && !firstInvalid && el.classList.contains('field-error')) firstInvalid = el;
      });

      if (!valid) { if (firstInvalid) firstInvalid.focus(); return; }

      success.hidden = false;
      form.reset();
      if (submitBtn) {
        submitBtn.textContent = 'Sent — thank you';
        submitBtn.disabled = true;
        setTimeout(() => {
          submitBtn.textContent = originalLabel;
          submitBtn.disabled = false;
          success.hidden = true;
        }, 5000);
      }
    });
  }
})();