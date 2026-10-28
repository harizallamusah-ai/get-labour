/* =========================================================================
   GET LABOUR COMPANY LIMITED (GLCL) - SITE BEHAVIOUR
   - Home-page-only loader: plays the compass animation exactly once (6 s)
   - Hero image slider (autoplay, arrows, dots, touch)
   - Universal scroll reveal for every content block
   - Mobile navigation, About tabs, Request Labour Gmail composer
   - Smooth back-to-top arrow
   Worker registration + PDF lives in assets/js/register.js and assets/js/pdf.js.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. LOADER (index.html only). One full animation cycle = 6000 ms.
  // =========================================================================
  const preloader = document.getElementById('glcl-preloader');
  const mainContent = document.getElementById('main-content');
  const REVEAL_ORDER = ['.site-header', '#hero-slider', '#main > section:not(#hero-slider)', '.site-footer, .lv-footer'];
  const revealPage = (stagger) => {
    if (stagger) {
      const groups = REVEAL_ORDER.map(sel => Array.from(document.querySelectorAll(sel)));
      groups.flat().forEach(el => el.classList.add('seq-hide'));
      mainContent && mainContent.classList.add('content-revealed');
      document.documentElement.classList.remove('has-loader');
      let t = 120;
      groups.forEach(list => list.forEach(el => { setTimeout(() => el.classList.add('seq-in'), t); t += 260; }));
    } else {
      if (mainContent) mainContent.classList.add('content-revealed');
      document.documentElement.classList.remove('has-loader');
    }
    document.querySelectorAll('.hero-glass-card').forEach(el => el.classList.add('is-revealed', 'sr-in'));
  };
  if (preloader) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const video = document.getElementById('glcl-loader-video');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      preloader.classList.add('preloader-hidden');
      setTimeout(() => revealPage(true), 900);
      setTimeout(() => { preloader.style.display = 'none'; }, 1900);
    };
    if (reduced || !video) {
      finish();
    } else {
      video.addEventListener('ended', finish);
      video.addEventListener('error', finish);
      const p = video.play && video.play();
      if (p && p.catch) p.catch(() => finish());
      video.addEventListener('loadedmetadata', () => {
        if (isFinite(video.duration)) setTimeout(finish, (video.duration + 3) * 1000);
      });
      setTimeout(() => { if (video.readyState < 2) finish(); }, 8000);
      setTimeout(finish, 30000);
    }
  } else {
    revealPage(false);
  }

  // =========================================================================
  // 2. ULTRA-SMOOTH MODERN HERO SLIDER (Ken Burns, Crossfade, Autoplay, Touch)
  // =========================================================================
  const heroSlider = document.getElementById('hero-slider');
  if (heroSlider) {
    const slides = heroSlider.querySelectorAll('.hero-slide');
    const dots = heroSlider.querySelectorAll('.slider-dots .dot');
    const prevBtn = heroSlider.querySelector('.slider-btn.prev');
    const nextBtn = heroSlider.querySelector('.slider-btn.next');

    let currentSlide = 0;
    let slideInterval = null;
    const slideDuration = 5500; // 5.5s autoplay dwell time

    function showSlide(index) {
      if (slides.length === 0) return;
      currentSlide = (index + slides.length) % slides.length;

      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentSlide);
      });

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
        dot.setAttribute('aria-current', idx === currentSlide ? 'true' : 'false');
      });
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function prevSlide() {
      showSlide(currentSlide - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      slideInterval = setInterval(nextSlide, slideDuration);
    }

    function stopAutoPlay() {
      if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
      }
    }

    // Controls listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
        startAutoPlay();
      });
    });

    // Pause autoplay on mouse hover (desktop)
    heroSlider.addEventListener('mouseenter', stopAutoPlay);
    heroSlider.addEventListener('mouseleave', startAutoPlay);

    // Touch Swipe Support for Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    heroSlider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    heroSlider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          nextSlide(); // Swiped left -> next
        } else {
          prevSlide(); // Swiped right -> prev
        }
      }
      startAutoPlay();
    }, { passive: true });

    // Initialize first slide and start autoplay
    showSlide(0);
    startAutoPlay();
  }

  // =========================================================================
  // 3. UNIVERSAL SCROLL REVEAL (every content block on every page)
  // =========================================================================
  const SR_SELECTORS = [
    '.reveal-up', '.reveal',
    'main section .wrap > *', 'main section .container > *',
    'main [class*="grid"] > *', 'main [class*="-list"] > *',
    'main .timeline-milestone', 'main form fieldset', 'main form > *',
    '.site-footer .footer-grid > *', '.site-footer .footer-credit'
  ].join(',');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const srNodes = Array.from(new Set(document.querySelectorAll(SR_SELECTORS)))
    .filter(el => !el.closest('#glcl-preloader') && !el.closest('.slider-track') && !el.classList.contains('hero-glass-card'));
  const showNode = el => el.classList.add('sr-in', 'is-revealed', 'is-visible');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    srNodes.forEach(showNode);
  } else {
    srNodes.forEach(el => el.classList.add('sr'));
    const srObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        showNode(entry.target);
        srObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    srNodes.forEach(el => srObserver.observe(el));
  }

  // =========================================================================
  // BACK TO TOP ARROW (smooth glide from anywhere on the page)
  // =========================================================================
  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'back-to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(toTop);
  const onScrollTop = () => toTop.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', onScrollTop, { passive: true });
  onScrollTop();
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  document.querySelectorAll('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); });

  // =========================================================================
  // 4. RESPONSIVE MOBILE NAVIGATION TOGGLE
  // =========================================================================
  const menuToggle = document.querySelector('.menu-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.innerHTML = isOpen ? 'Close ✕' : 'Menu ☰';
    });

    document.addEventListener('click', (e) => {
      if (!primaryNav.contains(e.target) && !menuToggle.contains(e.target) && primaryNav.classList.contains('open')) {
        primaryNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = 'Menu ☰';
      }
    });
  }

  // Auto-update year
  document.querySelectorAll('#current-year, .current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // =========================================================================
  // 5. ABOUT PAGE INTERACTIVE TABS (Our Story, Team, Gallery)
  // =========================================================================
  const aboutTabs = document.querySelectorAll('[data-about-tab]');
  const aboutPanels = document.querySelectorAll('.about-tab-panel');
  if (aboutTabs.length > 0 && aboutPanels.length > 0) {
    function setActiveTab(targetTabId) {
      aboutTabs.forEach(tab => {
        const isActive = tab.getAttribute('data-about-tab') === targetTabId;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });
      aboutPanels.forEach(panel => {
        const isMatch = panel.id === targetTabId;
        panel.classList.toggle('active', isMatch);
      });
    }

    aboutTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = tab.getAttribute('data-about-tab');
        setActiveTab(tabId);
        if (history.pushState) {
          history.pushState(null, null, '#' + tabId);
        } else {
          location.hash = '#' + tabId;
        }
      });
    });

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById(initialHash)) {
      setActiveTab(initialHash);
    }
  }

  // =========================================================================
  // 6. LABOUR REQUEST FORM: DYNAMIC ROLE FILTERING & GMAIL COMPOSE LAUNCHER
  // =========================================================================
  const categorySelect = document.querySelector('[data-category-select]');
  const roleSelect = document.querySelector('[data-role-select]');
  if (categorySelect && roleSelect) {
    categorySelect.addEventListener('change', () => {
      const selected = categorySelect.value;
      const options = roleSelect.querySelectorAll('option[data-role-category]');
      
      options.forEach(opt => {
        const cat = opt.dataset.roleCategory;
        if (!cat || cat === 'Both' || cat === selected || selected === 'Both' || selected === '') {
          opt.hidden = false;
          opt.disabled = false;
        } else {
          opt.hidden = true;
          opt.disabled = true;
        }
      });

      const currentOpt = roleSelect.selectedOptions[0];
      if (currentOpt && currentOpt.hidden) {
        roleSelect.value = '';
      }
    });
  }

  const labourForm = document.getElementById('labour-request-form');
  if (labourForm) {
    labourForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!labourForm.reportValidity()) return;

      const fd = new FormData(labourForm);
      const company = fd.get('company_name') || 'Direct Client';
      const contactName = fd.get('contact_name') || '';
      const phone = fd.get('phone') || '';
      const email = fd.get('email') || '';
      const service = fd.get('service_type') || fd.get('category') || 'General Labour Request';
      const role = fd.get('role_required') || 'Standard Gang / Skilled Operators';
      const quantity = fd.get('workers_needed') || 'As Required';
      const startDate = fd.get('start_date') || 'Immediate';
      const duration = fd.get('duration') || 'TBD';
      const location = fd.get('work_location') || 'Tema Port / Industrial Area';
      const shift = fd.get('shift_pattern') || 'Day / Regular Shift';
      const notes = fd.get('notes') || 'None provided';

      const subject = `Labour Manpower Request - ${company} (${role})`;
      const bodyLines = [
        `GET LABOUR COMPANY LIMITED - CLIENT LABOUR REQUEST`,
        `==================================================`,
        ``,
        `COMPANY / CLIENT: ${company}`,
        `CONTACT PERSON: ${contactName}`,
        `PHONE NUMBER: ${phone}`,
        `EMAIL ADDRESS: ${email}`,
        ``,
        `SERVICE CATEGORY: ${service}`,
        `ROLE / LABOUR TYPE: ${role}`,
        `ESTIMATED WORKERS NEEDED: ${quantity}`,
        `START DATE: ${startDate}`,
        `EXPECTED DURATION: ${duration}`,
        `WORK LOCATION / TERMINAL: ${location}`,
        `SHIFT TYPE: ${shift}`,
        ``,
        `OPERATIONAL DETAILS / SPECIFIC INSTRUCTIONS:`,
        `${notes}`,
        ``,
        `==================================================`,
        `Sent via GLCL Portal (getlabourcompanylimited@gmail.com)`
      ];
      const body = bodyLines.join('\n');

      // Compose URLs
      const targetEmail = 'getlabourcompanylimited@gmail.com';
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Show alert / confirmation on page
      let feedback = document.getElementById('labour-form-feedback');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'labour-form-feedback';
        feedback.className = 'glass-card card-ice-glass';
        feedback.style.marginTop = '24px';
        feedback.style.padding = '24px';
        feedback.style.borderLeft = '5px solid #2563EB';
        labourForm.parentNode.insertBefore(feedback, labourForm.nextSibling);
      }

      feedback.innerHTML = `
        <h3 style="color:#1E3A8A; margin-top:0; margin-bottom:10px; font-size:19px;">✓ Opening Gmail Compose Tab...</h3>
        <p style="color:#1F2937; margin-bottom:14px; line-height:1.5;">Your request details have been formatted and addressed to <strong>${targetEmail}</strong>.</p>
        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:12px;">
          <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding:10px 18px; font-size:14px;">Open in Gmail ↗</a>
          <a href="${mailtoUrl}" class="btn" style="padding:10px 18px; font-size:14px; background:#fff; border:1px solid #CBD5E1; color:#1E3A8A;">Open Default Email App ✉</a>
        </div>
      `;
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Open Gmail in a new tab
      window.open(gmailUrl, '_blank');
    });
  }

});

/* Footer WhatsApp credits: messages built from Unicode code points
   U+20B5 (₵) and U+1F44B U+1F3FC (👋🏼) so WhatsApp shows them exactly. */
(function () {
  const WAVE = '\u{1F44B}\u{1F3FC}';
  const CEDI = '\u20B5';
  const set = (sel, phone, name) => document.querySelectorAll(sel).forEach(a => {
    a.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent('Hi ' + name + ' ' + WAVE + ' , I need you to build a website for me.');
  });
  const run = () => { set('a.bans', '233244704066', 'Bans'); set('a.cedi-link', '233246905188', CEDI + 'edi'); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
