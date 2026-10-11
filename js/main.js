/* =========================================================
   Webtrix.pk — Agency Website Interactions & Performance Engine
   Author: Webtrix Engineering Studio
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year Update ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header / Nav Scroll State ---------- */
  const nav = $('#nav');
  const progressBar = $('#scrollProgress');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile Navigation Drawer ---------- */
  const toggle = $('#menuToggle');
  const menu = $('#mobileMenu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    if (menu) menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Interactive Glowing Star & Constellation Canvas ---------- */
  const canvas = $('#bgCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, particles = [];
    const mouse = { x: -1000, y: -1000, radius: 150 };

    const colors = [
      { fill: 'rgba(0, 242, 254, 0.85)', glow: 'rgba(0, 242, 254, 0.6)' },   // Cyber Cyan
      { fill: 'rgba(255, 110, 60, 0.85)', glow: 'rgba(255, 110, 60, 0.6)' }, // Solar Orange
      { fill: 'rgba(139, 92, 246, 0.85)', glow: 'rgba(139, 92, 246, 0.6)' }, // Electric Violet
      { fill: 'rgba(255, 235, 160, 0.9)', glow: 'rgba(255, 235, 160, 0.5)' }  // Starlight Gold
    ];

    const resize = () => {
      if (!canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.min(Math.floor((w * h) / 14000), 65);
      for (let i = 0; i < count; i++) {
        const col = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2.2 + 1.2,
          fill: col.fill,
          glow: col.glow,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    };

    // Shooting stars system
    let shootingStars = [];
    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * (w * 0.8),
        y: Math.random() * (h * 0.4),
        len: Math.random() * 80 + 60,
        speed: Math.random() * 8 + 7,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        opacity: 1
      });
    };
    setInterval(spawnShootingStar, 5500);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }, { passive: true });

    resize();

    let animFrame = null;
    let isCanvasVisible = true;

    const draw = () => {
      if (!isCanvasVisible) return;
      ctx.clearRect(0, 0, w, h);

      // Draw shooting stars
      for (let s = shootingStars.length - 1; s >= 0; s--) {
        const star = shootingStars[s];
        const tailX = star.x - Math.cos(star.angle) * star.len;
        const tailY = star.y - Math.sin(star.angle) * star.len;

        const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(1, `rgba(255, 255, 255, ${star.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.018;

        if (star.opacity <= 0 || star.x > w || star.y > h) {
          shootingStars.splice(s, 1);
        }
      }

      // Draw constellation particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Subtle mouse push & pull
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }

        // Particle twinkle
        p.twinklePhase += p.twinkleSpeed;
        const alpha = 0.55 + Math.sin(p.twinklePhase) * 0.45;

        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.fill.replace(/[\d\.]+\)$/, `${alpha})`);
        ctx.fill();
        ctx.restore();

        // Connect lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 125) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineOpacity = 0.18 * (1 - d / 125);
            ctx.strokeStyle = `rgba(180, 160, 245, ${lineOpacity})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }
      animFrame = requestAnimationFrame(draw);
    };

    const heroEl = $('#home');
    if (heroEl && 'IntersectionObserver' in window) {
      const heroObs = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          isCanvasVisible = en.isIntersecting;
          if (isCanvasVisible) {
            cancelAnimationFrame(animFrame);
            draw();
          } else {
            cancelAnimationFrame(animFrame);
          }
        });
      }, { threshold: 0.05 });
      heroObs.observe(heroEl);
    } else {
      draw();
    }
  }

  /* ---------- Kinetic Text Cycler (Hero Subtitle Pill) ---------- */
  const cyclerTrack = $('#cyclerTrack');
  if (cyclerTrack) {
    const items = $$('.cycler-item', cyclerTrack);
    if (items.length > 1) {
      let cur = 0;
      setInterval(() => {
        const prev = cur;
        cur = (cur + 1) % items.length;
        items[prev].classList.remove('active');
        items[prev].classList.add('exit');
        items[cur].classList.remove('exit');
        items[cur].classList.add('active');
        setTimeout(() => {
          items[prev].classList.remove('exit');
        }, 500);
      }, 2900);
    }
  }

  /* ---------- Reveal On Scroll Animations ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        revealObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => revealObs.observe(el));

  /* ---------- Score Rings Animation ---------- */
  const scoreObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        $$('.score', en.target).forEach((s, i) => setTimeout(() => s.classList.add('in'), i * 150));
        scoreObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 });
  $$('.score-mock').forEach((el) => scoreObs.observe(el));

  /* ---------- Metric Counters ---------- */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const to = parseInt(el.dataset.to, 10);
      if (reduceMotion) { el.textContent = to; return; }
      const dur = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.count').forEach((el) => countObs.observe(el));

  /* ---------- Approach Step Progress Line ---------- */
  const steps = $('#steps');
  const progress = $('#stepsProgress');
  if (steps && progress) {
    const updateLine = () => {
      const r = steps.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max((vh * 0.8 - r.top) / (r.height + vh * 0.3), 0), 1);
      progress.style.width = (p * 100) + '%';
    };
    window.addEventListener('scroll', updateLine, { passive: true });
    updateLine();
  }

  /* ---------- FAQ Accordion ---------- */
  $$('.faq-item').forEach((item) => {
    const btn = $('.faq-q', item);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('.faq-item.open').forEach((o) => {
        o.classList.remove('open');
        const q = $('.faq-q', o);
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Preselect Service In Form ---------- */
  // CTAs on other pages link to contact.html?service=<value>#contact
  const preselectService = (val, exclusive) => {
    const boxes = $$('#serviceOptions input');
    if (!boxes.some((cb) => cb.value === val)) return;
    boxes.forEach((cb) => {
      if (cb.value === val) {
        cb.checked = true;
        const fld = cb.closest('.field');
        if (fld) fld.classList.remove('error');
      } else if (exclusive) {
        cb.checked = false;
      }
    });
  };
  const serviceParam = new URLSearchParams(window.location.search).get('service');
  if (serviceParam) preselectService(serviceParam, true);
  $$('[data-service]').forEach((link) => {
    link.addEventListener('click', () => preselectService(link.dataset.service, false));
  });

  /* ---------- Desktop Micro-Interactions & 3D Hologram Tilt ---------- */
  if (isFinePointer && !reduceMotion) {
    // Cursor glow follow
    const glow = $('.cursor-glow');
    if (glow) {
      let gx = 0, gy = 0, tx = 0, ty = 0;
      window.addEventListener('mousemove', (e) => {
        tx = e.clientX; ty = e.clientY;
        document.body.classList.add('has-cursor');
      }, { passive: true });
      const loop = () => {
        gx += (tx - gx) * 0.12;
        gy += (ty - gy) * 0.12;
        glow.style.transform = `translate(${gx - 260}px, ${gy - 260}px)`;
        requestAnimationFrame(loop);
      };
      loop();
    }

    // Magnetic buttons
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    // 3D Parallax Tilt for Digital Platform Poster Showcase
    const posterWrapper = $('#heroPosterWrapper');
    const poster = $('#heroPoster');
    const satBadges = posterWrapper ? $$('.sat-badge', posterWrapper) : [];
    if (posterWrapper && poster) {
      posterWrapper.addEventListener('mousemove', (e) => {
        const r = posterWrapper.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        poster.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(10px)`;

        // Stereoscopic counter-translation on satellite badges
        satBadges.forEach((b, idx) => {
          const factor = (idx + 1) * 6;
          b.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
      });
      posterWrapper.addEventListener('mouseleave', () => {
        poster.style.transform = '';
        satBadges.forEach((b) => { b.style.transform = ''; });
      });
    }

    // Spotlight glow on cards
    $$('.why-card, .about-card, .pf-card, .svc-card, .hs-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Portfolio Showcase Filtering & Lightbox ---------- */
  const pfFilters = $$('.pf-filter');
  const pfCards = $$('.pf-card');
  const lightbox = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCat = $('#lbCat');
  const lbTitle = $('#lbTitle');
  const lbCta = $('#lbCta');
  const lbClose = lightbox ? $('.lb-close', lightbox) : null;
  const lbPrev = lightbox ? $('.lb-prev', lightbox) : null;
  const lbNext = lightbox ? $('.lb-next', lightbox) : null;

  let currentLbIndex = 0;
  const getVisibleCards = () => pfCards.filter(c => c.getAttribute('data-hidden') !== 'true');

  // With an odd number of regular cards showing, let the last one fill its row
  const balanceGrid = () => {
    const regular = getVisibleCards().filter((c) => !c.classList.contains('pf-featured'));
    pfCards.forEach((c) => c.classList.remove('pf-span'));
    if (regular.length % 2 === 1) regular[regular.length - 1].classList.add('pf-span');
  };
  balanceGrid();

  pfFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      pfFilters.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      pfCards.forEach(card => {
        const matches = (filter === 'all' || card.dataset.cat === filter);
        if (matches) {
          card.removeAttribute('data-hidden');
        } else {
          card.setAttribute('data-hidden', 'true');
        }
      });
      balanceGrid();
    });
  });

  const updateLightbox = (index) => {
    const visible = getVisibleCards();
    if (!visible.length) return;
    currentLbIndex = (index + visible.length) % visible.length;
    const card = visible[currentLbIndex];
    const img = $('img', card);
    const cat = $('.pf-cat', card);
    const title = $('h3', card);

    if (img && lbImg) {
      lbImg.src = img.src;
      lbImg.alt = img.alt || '';
    }
    if (cat && lbCat) lbCat.textContent = cat.textContent;
    if (title && lbTitle) lbTitle.textContent = title.textContent;
    const svcLink = $('[data-service]', card);
    if (svcLink && lbCta) lbCta.href = svcLink.href;
  };

  const openLightbox = (card) => {
    const visible = getVisibleCards();
    const idx = visible.indexOf(card);
    if (idx !== -1 && lightbox) {
      updateLightbox(idx);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  pfCards.forEach((card) => {
    const mediaBtn = $('.pf-media', card);
    if (mediaBtn) {
      mediaBtn.addEventListener('click', () => openLightbox(card));
    }
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', () => updateLightbox(currentLbIndex - 1));
  if (lbNext) lbNext.addEventListener('click', () => updateLightbox(currentLbIndex + 1));

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') updateLightbox(currentLbIndex - 1);
    if (e.key === 'ArrowRight') updateLightbox(currentLbIndex + 1);
  });

  /* ================= DIRECT EMAIL ACTION MODAL ================= */
  const emailModal = $('#emailModal');
  const emClose = $('#emClose');
  const emBackdrop = $('#emBackdrop');
  const emCopyBtn = $('#emCopyBtn');
  const emCopyText = $('#emCopyText');
  const emCopyBadge = $('#emCopyBadge');
  const AGENCY_EMAIL = 'webtrixdevofficial@gmail.com';

  const openEmailModal = (customSubject, customBody) => {
    if (!emailModal) return;
    const gmailBtn = $('#emGmailBtn');
    const defaultBtn = $('#emDefaultBtn');

    const subject = customSubject || 'Project Inquiry — Webtrix.pk';
    const body = customBody || '';

    if (gmailBtn) {
      gmailBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${AGENCY_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    if (defaultBtn) {
      defaultBtn.href = `mailto:${AGENCY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    emailModal.classList.add('active');
    emailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeEmailModal = () => {
    if (!emailModal) return;
    emailModal.classList.remove('active');
    emailModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (emClose) emClose.addEventListener('click', closeEmailModal);
  if (emBackdrop) emBackdrop.addEventListener('click', closeEmailModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && emailModal && emailModal.classList.contains('active')) {
      closeEmailModal();
    }
  });

  // Intercept all mailto links on the page so Windows doesn't launch a blank Chrome window
  $$('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      // If clicking inside the modal's default client button, let it proceed
      if (link.id === 'emDefaultBtn') return;
      e.preventDefault();
      openEmailModal();
    });
  });

  // Copy email to clipboard with live visual feedback
  if (emCopyBtn) {
    emCopyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(AGENCY_EMAIL);
        if (emCopyText) emCopyText.textContent = 'Copied to Clipboard! ✓';
        if (emCopyBadge) {
          emCopyBadge.textContent = 'Copied!';
          emCopyBadge.style.background = '#3DDC97';
          emCopyBadge.style.color = '#08281A';
        }
        setTimeout(() => {
          if (emCopyText) emCopyText.textContent = 'Copy Email Address';
          if (emCopyBadge) {
            emCopyBadge.textContent = 'Copy';
            emCopyBadge.style.background = '';
            emCopyBadge.style.color = '';
          }
        }, 2400);
      } catch (err) {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = AGENCY_EMAIL;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        if (emCopyText) emCopyText.textContent = 'Copied to Clipboard! ✓';
      }
    });
  }

  /* ---------- Floating "Start a project" bar (phones) ---------- */
  const mobileCta = $('.mobile-cta');
  if (mobileCta) {
    const toggleCta = () => mobileCta.classList.toggle('show', window.scrollY > 500);
    toggleCta();
    window.addEventListener('scroll', toggleCta, { passive: true });
  }

  /* ---------- Guided Project Brief (3-step contact form) ---------- */
  const form = $('#contactForm');

  if (form) {
    const status = $('#formStatus');
    const submitBtn = $('#submitBtn');
    const stepEls = $$('.fstep', form);
    const stepLabels = $$('.fs-labels li', form);
    const bar = $('#fsBar');
    const summary = $('#fsSummary');
    const charCount = $('#charCount');
    const serviceBoxes = $$('#serviceOptions input');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const MIN_MESSAGE = 20;
    const DRAFT_KEY = 'webtrix-brief-draft';
    const lastStep = stepEls.length - 1;
    const stepped = stepEls.length > 1;
    let stepIdx = 0;

    const val = (name) => {
      const el = form.elements[name];
      return el ? String(el.value || '').trim() : '';
    };
    const cleanEmail = (v) => v.replace(/[​-‍﻿ \s]/g, '');

    const setStatus = (type, text) => {
      if (!status) return;
      status.className = 'form-status' + (type ? ' ' + type : '');
      status.textContent = text;
    };

    // Required fields, grouped by the step they live on
    const fieldChecks = {
      'field-service': () => serviceBoxes.some((c) => c.checked),
      'field-message': () => val('message').length >= MIN_MESSAGE,
      'field-name': () => val('name').length >= 2,
      'field-email': () => emailRegex.test(cleanEmail(form.elements.email.value))
    };
    const stepFields = [['field-service'], ['field-message'], ['field-name', 'field-email']];

    const setError = (id, bad) => {
      const fld = $('#' + id);
      if (!fld) return;
      fld.classList.toggle('error', bad);
      const input = $('input:not([type="checkbox"]), textarea', fld);
      if (input) input.setAttribute('aria-invalid', String(bad));
    };

    // Returns the first invalid control on a step, or null when the step is complete
    const validateStep = (i) => {
      let first = null;
      (stepFields[i] || []).forEach((id) => {
        const ok = fieldChecks[id]();
        setError(id, !ok);
        if (!ok && !first) first = $('input, textarea', $('#' + id));
      });
      return first;
    };

    const renderSummary = () => {
      if (!summary) return;
      const services = $$('#serviceOptions input:checked').map((c) => {
        const label = $('strong', c.nextElementSibling);
        return label ? label.textContent : c.value;
      });
      const rows = [
        ['Services', services.join(', ')],
        ['Project type', val('project_type')],
        ['Budget', val('budget')],
        ['Timeline', val('timeline')]
      ].filter((r) => r[1]);
      summary.innerHTML = rows.map(([k, v]) => `<div>${k}: <b>${escapeHtml(v)}</b></div>`).join('') +
        '<button type="button" data-goto="0">Edit project details</button>';
    };

    const showStep = (i, focus = true) => {
      stepIdx = Math.max(0, Math.min(i, lastStep));
      stepEls.forEach((el, n) => el.classList.toggle('active', n === stepIdx));
      stepLabels.forEach((li, n) => {
        li.classList.toggle('active', n === stepIdx);
        li.classList.toggle('done', n < stepIdx);
      });
      if (bar) bar.style.width = ((stepIdx + 1) / stepEls.length) * 100 + '%';
      if (stepIdx === lastStep) renderSummary();
      if (!focus) return;
      const top = form.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) {
        form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
      const first = $('input:not([type="hidden"]):not(.hp), textarea, select', stepEls[stepIdx]);
      if (first) first.focus({ preventScroll: true });
    };

    const goNext = () => {
      const bad = validateStep(stepIdx);
      if (bad) { bad.focus(); return; }
      showStep(stepIdx + 1);
    };

    $$('.fs-next', form).forEach((btn) => btn.addEventListener('click', goNext));
    $$('.fs-back', form).forEach((btn) => btn.addEventListener('click', () => showStep(stepIdx - 1)));
    if (summary) {
      summary.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-goto]');
        if (btn) showStep(parseInt(btn.dataset.goto, 10));
      });
    }

    /* Message character guide */
    const msgInput = form.elements.message;
    const updateCount = () => {
      if (!charCount || !msgInput) return;
      const n = msgInput.value.trim().length;
      charCount.textContent = n < MIN_MESSAGE ? `${n} / ${MIN_MESSAGE} min` : `${n} characters`;
      charCount.classList.toggle('ok', n >= MIN_MESSAGE);
    };

    /* Draft autosave, so a client never loses what they typed */
    const saveDraft = () => {
      try {
        const data = {};
        [...form.elements].forEach((el) => {
          if (!el.name || el.type === 'hidden' || el.name.startsWith('_')) return;
          if (el.type === 'checkbox' || el.type === 'radio') {
            if (el.checked) (data[el.name] = data[el.name] || []).push(el.value);
          } else {
            data[el.name] = el.value;
          }
        });
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      } catch (err) { /* storage unavailable */ }
    };
    const restoreDraft = () => {
      let data = null;
      try { data = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (err) { return; }
      if (!data) return;
      [...form.elements].forEach((el) => {
        if (!el.name || el.type === 'hidden' || el.name.startsWith('_') || !(el.name in data)) return;
        // A service chosen via a "Discuss…" button wins over the saved draft
        if (el.name === 'service' && serviceParam) return;
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = Array.isArray(data[el.name]) && data[el.name].includes(el.value);
        } else {
          el.value = data[el.name];
        }
      });
    };
    const clearDraft = () => {
      try { localStorage.removeItem(DRAFT_KEY); } catch (err) { /* storage unavailable */ }
    };

    /* Live feedback while typing */
    const onEdit = (e) => {
      const t = e.target;
      if (t === form.elements.email) {
        const cleaned = cleanEmail(t.value);
        if (cleaned !== t.value) t.value = cleaned;
        const fld = $('#field-email');
        if (fld) fld.classList.toggle('valid', emailRegex.test(cleaned));
      }
      if (t === msgInput) updateCount();
      const fld = t.closest('.field');
      if (fld && fld.classList.contains('error') && fieldChecks[fld.id] && fieldChecks[fld.id]()) {
        setError(fld.id, false);
      }
      if (status && status.classList.contains('err')) setStatus('', '');
      saveDraft();
    };
    form.addEventListener('input', onEdit);
    form.addEventListener('change', onEdit);

    /* Submission */
    const submitHTML = submitBtn ? submitBtn.innerHTML : '';
    const setLoading = (on) => {
      if (!submitBtn) return;
      submitBtn.disabled = on;
      submitBtn.classList.toggle('loading', on);
      submitBtn.innerHTML = on ? 'Sending your brief…' : submitHTML;
    };

    const copyText = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    };

    const showDone = (name, email) => {
      const firstName = name.split(/\s+/)[0];
      form.classList.remove('is-stepped');
      form.innerHTML = `
        <div class="form-done" tabindex="-1">
          <div class="done-icon"><svg class="i"><use href="#i-check" /></svg></div>
          <h2>Thank you, ${escapeHtml(firstName)}. Your brief is with us.</h2>
          <p>We've received your project details and will reply to <strong>${escapeHtml(email)}</strong> within one business day.</p>
          <div class="next-steps">
            <h3 class="next-title">What happens next</h3>
            <ol>
              <li><span>1</span><div><strong>We review your brief</strong><p>A senior engineer reads your requirements in full.</p></div></li>
              <li><span>2</span><div><strong>Free consultation call</strong><p>We'll suggest a time to talk through your goals and questions.</p></div></li>
              <li><span>3</span><div><strong>Clear proposal</strong><p>Scope, milestones, timeline and price, written in plain language.</p></div></li>
            </ol>
          </div>
          <div class="done-actions">
            <a href="portfolio.html" class="btn btn-ghost">View our work</a>
            <a href="index.html" class="btn btn-primary">Back to home <svg class="i"><use href="#i-arrow" /></svg></a>
          </div>
        </div>`;
      form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      const done = $('.form-done', form);
      if (done) done.focus({ preventScroll: true });
    };

    const showFallback = (mailBody, gmailUrl, mailtoUrl) => {
      if (!status) return;
      status.className = 'form-status';
      status.innerHTML = `
        <div class="send-fallback">
          <h4>Your brief is ready to send</h4>
          <p>We couldn't send it automatically just now. You can send it by email in one click instead. Everything you entered is already filled in.</p>
          <div class="form-file-actions">
            <a href="${gmailUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-block">Send with Gmail <svg class="i"><use href="#i-arrow" /></svg></a>
            <a href="${mailtoUrl}" class="btn btn-ghost btn-block">Use my email app</a>
            <button type="button" class="btn btn-ghost btn-block" id="copyBriefBtn">Copy brief to clipboard</button>
          </div>
        </div>`;
      const copyBtn = $('#copyBriefBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          await copyText(mailBody);
          copyBtn.textContent = '✓ Brief copied. Paste it into an email to ' + AGENCY_EMAIL;
        });
      }
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Enter on an earlier step moves forward instead of submitting
      if (stepped && stepIdx < lastStep) { goNext(); return; }

      for (let i = 0; i <= lastStep; i++) {
        const bad = validateStep(i);
        if (bad) {
          if (stepped && i !== stepIdx) showStep(i, false);
          bad.focus();
          setStatus('err', 'Please complete the highlighted fields.');
          return;
        }
      }

      // Honeypot: bots fill hidden fields, people don't
      if (form.elements._honey && form.elements._honey.value) return;

      const NS = 'Not specified';
      const brief = {
        name: val('name'),
        email: cleanEmail(form.elements.email.value),
        company: val('company'),
        phone: val('phone'),
        contactPref: val('contact_pref'),
        services: $$('#serviceOptions input:checked').map((c) => c.value).join(', '),
        projectType: val('project_type'),
        budget: val('budget'),
        timeline: val('timeline'),
        website: val('website'),
        message: val('message')
      };

      const mailBody = [
        `Name: ${brief.name}`,
        `Email: ${brief.email}`,
        `Company: ${brief.company || NS}`,
        `Phone / WhatsApp: ${brief.phone || NS}`,
        `Preferred contact: ${brief.contactPref || NS}`,
        '',
        `Services: ${brief.services}`,
        `Project type: ${brief.projectType || NS}`,
        `Budget: ${brief.budget || NS}`,
        `Timeline: ${brief.timeline || NS}`,
        `Website / reference: ${brief.website || NS}`,
        '',
        'Project description:',
        brief.message
      ].join('\n');
      const mailSubject = `New Project Enquiry from ${brief.name}${brief.company ? ' (' + brief.company + ')' : ''}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${AGENCY_EMAIL}&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
      const mailtoUrl = `mailto:${AGENCY_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

      setStatus('', '');

      // FormSubmit rejects pages opened straight from disk, so offer email instead
      if (window.location.protocol === 'file:') {
        console.info('[Webtrix] Opened from a local file: online form sending works once the site is hosted.');
        showFallback(mailBody, gmailUrl, mailtoUrl);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${AGENCY_EMAIL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: brief.name,
            email: brief.email,
            _replyto: brief.email,
            company: brief.company || NS,
            phone: brief.phone || NS,
            preferred_contact: brief.contactPref || NS,
            services: brief.services,
            project_type: brief.projectType || NS,
            budget: brief.budget || NS,
            timeline: brief.timeline || NS,
            website: brief.website || NS,
            message: brief.message,
            _subject: mailSubject,
            _template: 'table',
            _captcha: 'false'
          })
        });
        const data = await res.json().catch(() => ({}));
        const sent = res.ok && (data.success === true || data.success === 'true');
        if (!sent) {
          // e.g. FormSubmit asking the site owner to activate the form: owner-only info, kept out of the UI
          console.warn('[Webtrix] Form not delivered:', data.message || res.status,
            `If FormSubmit asks for activation, confirm the email it sent to ${AGENCY_EMAIL}.`);
          throw new Error(data.message || 'Submission failed');
        }
        clearDraft();
        showDone(brief.name, brief.email);
      } catch (err) {
        showFallback(mailBody, gmailUrl, mailtoUrl);
      } finally {
        setLoading(false);
      }
    });

    /* Initial state */
    restoreDraft();
    updateCount();
    if (stepped) {
      form.classList.add('is-stepped');
      showStep(0, false);
    }
  }

  // Helper to prevent XSS in DOM text injection
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
