/* =================================================================
   TAILOR MADE WINDOW DECOR — SCRIPT
   Sections:
     1. Hero roller gallery (vertical infinite loop)
     2. Header scroll state + mobile nav toggle
     3. Scroll reveal animations
     4. Hero word rotator
     5. Floating actions + WhatsApp preview
     6. Contact form (UI only, no backend)
================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.hero .reveal').forEach((el) => el.classList.add('is-visible'));


  /* ===============================================================
     1. HERO ROLLER GALLERY — vertical infinite loop
     ---------------------------------------------------------------
     The track's HTML already has one full set of images. We clone
     that set once so the track contains two identical halves, then
     let the CSS animation (rollerLoop) scroll the track up by exactly
     50% of its height, looping seamlessly back to 0%.
  =============================================================== */
  const rollerTracks = document.querySelectorAll('.roller-blade-track');
  let rollerStarted = false;

  function startRollerGallery() {
    if (rollerStarted || !rollerTracks.length) return;
    rollerStarted = true;

    // Duplicate each blade's image set so the CSS can roll upward by 50%
    // and loop back to an identical frame without a visual jump.
    rollerTracks.forEach((track) => {
      if (track.dataset.cloned === 'true') return;
      const originalImages = Array.from(track.children);
      originalImages.forEach((img) => {
        const clone = img.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
      track.dataset.cloned = 'true';
    });
  }

  startRollerGallery();


  /* ===============================================================
     2. HEADER SCROLL STATE + MOBILE NAV TOGGLE
  =============================================================== */
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  function updateHeaderState() {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  function setMobileNavOpen(isOpen) {
    mainNav.classList.toggle('open', isOpen);
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  }

  navToggle.addEventListener('click', () => {
    setMobileNavOpen(!mainNav.classList.contains('open'));
  });

  // Close mobile nav after tapping a link
  mainNav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      setMobileNavOpen(false);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMobileNavOpen(false);
  });


  /* ===============================================================
     3. SCROLL REVEAL ANIMATIONS
     ---------------------------------------------------------------
     Simple IntersectionObserver-based fade/rise. Elements with the
     .reveal class start hidden (see CSS) and gain .is-visible once
     they enter the viewport.
  =============================================================== */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));

  // Make sure anything already in view gets revealed immediately.
  function checkReveals() {
    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });
  }

  let revealTicking = false;
  function scheduleRevealCheck() {
    if (revealTicking) return;
    revealTicking = true;
    requestAnimationFrame(() => {
      checkReveals();
      revealTicking = false;
    });
  }

  window.addEventListener('scroll', scheduleRevealCheck, { passive: true });
  window.addEventListener('resize', scheduleRevealCheck);
  scheduleRevealCheck();

  /* ===============================================================
     5. WHO WE ARE IMAGE - posh sticky slat scroll reveal
     ---------------------------------------------------------------
     Five image strips slide into a calm finished composition while the
     sticky stage gently brightens. The strips use the same local image
     and aligned background positions for a premium editorial reveal.
  =============================================================== */
  const whoSection = document.querySelector('.who-we-are-section');
  const whoImageWrap = document.querySelector('[data-who-image]');
  const prefersReducedMotion = reduceMotion;

  if (whoSection && whoImageWrap) {
    const slatsLayer = whoImageWrap.querySelector('.who-slats');
    const whoImage = whoImageWrap.querySelector('.who-image');
    const slatOffsets = [-118, -58, -96, -34, -82];
    const desktopSlatHeights = [47, 64, 78, 75, 58];
    const mobileSlatHeights = [50, 66, 80, 76, 58];

    if (whoImage) {
      whoImageWrap.style.setProperty('--who-image-url', `url("${whoImage.currentSrc || whoImage.src}")`);
    }

    if (slatsLayer && !slatsLayer.children.length) {
      slatOffsets.forEach(() => {
        const slat = document.createElement('span');
        slat.className = 'who-slat';
        slatsLayer.appendChild(slat);
      });
    }

    const whoSlats = Array.from(whoImageWrap.querySelectorAll('.who-slat'));

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function smoothStep(value) {
      return value * value * (3 - (2 * value));
    }

    function syncWhoSlatBackgrounds() {
      if (!whoSlats.length) return;
      const stageWidth = slatsLayer ? slatsLayer.clientWidth : whoImageWrap.clientWidth;
      const stageHeight = slatsLayer ? slatsLayer.clientHeight : whoImageWrap.clientHeight;
      whoSlats.forEach((slat) => {
        const left = slat.offsetLeft;
        const top = slat.offsetTop;
        slat.style.setProperty('--who-bg-size', `${stageWidth}px ${stageHeight}px`);
        slat.style.setProperty('--who-bg-position', `${-left}px ${-top}px`);
      });
    }

    if (!prefersReducedMotion) {
      let whoTicking = false;
      const isMobile = () => window.matchMedia('(max-width: 760px)').matches;

      function updateWhoImageReveal() {
        const rect = whoSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const travel = Math.max(viewportHeight * 0.82, whoSection.offsetHeight * 0.36);
        const rawProgress = ((viewportHeight * 0.58) - rect.top) / travel;
        const progress = smoothStep(clamp(rawProgress, 0, 1));
        const mobile = isMobile();
        const mobileIntensity = mobile ? 0.42 : 1;
        const slatStartHeights = mobile ? mobileSlatHeights : desktopSlatHeights;

        const scale = 1;
        const brightness = 0.94 + (progress * 0.08);
        const lightX = -55 + (progress * 145);
        const lightOpacity = Math.min(Math.sin(progress * Math.PI) * 0.30, 0.34);

        whoSection.style.setProperty('--who-progress', progress.toFixed(3));
        whoSection.style.setProperty('--who-scale', scale.toFixed(4));
        whoSection.style.setProperty('--who-brightness', brightness.toFixed(3));
        whoSection.style.setProperty('--who-light-x', `${lightX.toFixed(1)}%`);
        whoSection.style.setProperty('--who-light-opacity', lightOpacity.toFixed(3));

        whoSlats.forEach((slat, index) => {
          const startOffset = slatOffsets[index] * mobileIntensity;
          const y = startOffset + (progress * Math.abs(startOffset));
          const stageHeight = slatsLayer ? slatsLayer.clientHeight : whoImageWrap.clientHeight;
          const startHeight = stageHeight * ((slatStartHeights[index] || 60) / 100);
          const currentHeight = startHeight + (progress * (stageHeight - startHeight));
          slat.style.setProperty('--who-slat-y', `${y.toFixed(1)}px`);
          slat.style.setProperty('--who-slat-current-height', `${currentHeight.toFixed(1)}px`);
        });

        syncWhoSlatBackgrounds();
      }

      function scheduleWhoImageReveal() {
        if (whoTicking) return;
        whoTicking = true;
        requestAnimationFrame(() => {
          updateWhoImageReveal();
          whoTicking = false;
        });
      }

      window.addEventListener('scroll', scheduleWhoImageReveal, { passive: true });
      window.addEventListener('resize', scheduleWhoImageReveal);
      window.addEventListener('load', scheduleWhoImageReveal);
      scheduleWhoImageReveal();
    } else {
      syncWhoSlatBackgrounds();
      whoSlats.forEach((slat) => {
        slat.style.setProperty('--who-slat-y', '0px');
        slat.style.setProperty('--who-slat-current-height', '100%');
      });
      window.addEventListener('resize', syncWhoSlatBackgrounds);
    }
  }

  /* ===============================================================
     6. HERO WORD ROTATOR
     ---------------------------------------------------------------
     Cycles the main hero service word with a blind-like vertical reveal.
  =============================================================== */
  const heroWords = Array.from(document.querySelectorAll('.hero-word'));
  let activeHeroWord = 0;

  if (heroWords.length > 1) {
    setInterval(() => {
      const current = heroWords[activeHeroWord];
      activeHeroWord = (activeHeroWord + 1) % heroWords.length;
      const next = heroWords[activeHeroWord];

      current.classList.remove('is-active');
      current.classList.add('is-exiting');
      next.classList.add('is-active');

      setTimeout(() => {
        current.classList.remove('is-exiting');
      }, 760);
    }, 2600);
  }

  /* ===============================================================
     7. PREMIUM BLINDS / CURTAINS CONFIGURATOR
  =============================================================== */
  const configurator = document.getElementById('configurator');

  if (configurator) {
    const productData = {
      roller: { label: 'Roller Blind', rate: 1450 },
      venetian: { label: 'Venetian Blind', rate: 1800 },
      vertical: { label: 'Vertical Blind', rate: 1300 },
      roman: { label: 'Roman Blind', rate: 2200 },
      sheer: { label: 'Sheer Curtain', rate: 1850 },
      blockout: { label: 'Blockout Curtain', rate: 2300 },
      zebra: { label: 'Zebra Blind', rate: 2100 }
    };

    const roomData = {
      living: 'Living Room',
      bedroom: 'Bedroom',
      kitchen: 'Kitchen',
      office: 'Office',
      patio: 'Patio'
    };

    const finishData = {
      linen: { label: 'Warm Linen', multiplier: 1, color: '#d8c2a0', shadow: 'rgba(91, 70, 54, 0.24)' },
      oat: { label: 'Soft Oat', multiplier: 1.08, color: '#ece3d2', shadow: 'rgba(91, 70, 54, 0.18)' },
      walnut: { label: 'Walnut', multiplier: 1.18, color: '#7a5237', shadow: 'rgba(43, 38, 32, 0.36)' },
      charcoal: { label: 'Charcoal', multiplier: 1.16, color: '#34302b', shadow: 'rgba(43, 38, 32, 0.44)' }
    };

    const extrasData = {
      installation: { label: 'Professional installation', fixed: 850, areaRate: 160 },
      lining: { label: 'Blockout lining', percent: 0.18 },
      motorisation: { label: 'Motorisation', fixed: 1850 },
      rail: { label: 'Curtain rail/track', fixed: 650, areaRate: 80 },
      safety: { label: 'Child safety chain', fixed: 180 }
    };

    const configState = {
      product: 'roller',
      room: 'living',
      width: 1200,
      height: 1200,
      finish: 'linen',
      extras: []
    };

    const widthInput = document.getElementById('configWidth');
    const heightInput = document.getElementById('configHeight');
    const treatment = document.getElementById('windowTreatment');
    const stage = configurator.querySelector('[data-preview-stage]');
    const leadForm = document.getElementById('configLeadForm');
    const quoteSuccess = document.getElementById('quoteSuccess');
    const configuratorModal = document.getElementById('configuratorModal');
    const configuratorOpenButtons = document.querySelectorAll('[data-configurator-open]');
    const configuratorCloseButtons = document.querySelectorAll('[data-configurator-close]');
    let configuratorLastFocus = null;
    const currency = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    });

    function openConfiguratorModal(trigger) {
      if (!configuratorModal) return;
      configuratorLastFocus = trigger || document.activeElement;
      configuratorModal.inert = false;
      configuratorModal.classList.add('is-open');
      configuratorModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('configurator-open');

      const firstField = configuratorModal.querySelector('input[name="configProduct"]');
      setTimeout(() => {
        if (firstField) firstField.focus({ preventScroll: true });
      }, 80);
    }

    function closeConfiguratorModal() {
      if (!configuratorModal) return;
      configuratorModal.classList.remove('is-open');
      configuratorModal.setAttribute('aria-hidden', 'true');
      configuratorModal.inert = true;
      document.body.classList.remove('configurator-open');

      if (configuratorLastFocus && typeof configuratorLastFocus.focus === 'function') {
        configuratorLastFocus.focus({ preventScroll: true });
      }
    }

    configuratorOpenButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        openConfiguratorModal(button);
      });
    });

    configuratorCloseButtons.forEach((button) => {
      button.addEventListener('click', closeConfiguratorModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && configuratorModal && configuratorModal.classList.contains('is-open')) {
        closeConfiguratorModal();
      }
    });

    function cfgClamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function formatRand(value) {
      return currency.format(Math.round(value / 10) * 10).replace('ZAR', 'R');
    }

    function getArea() {
      return Math.max(1, (configState.width / 1000) * (configState.height / 1000));
    }

    function calculateEstimate() {
      const area = getArea();
      const product = productData[configState.product];
      const finish = finishData[configState.finish];
      let subtotal = area * product.rate * finish.multiplier;

      configState.extras.forEach((extraKey) => {
        const extra = extrasData[extraKey];
        if (!extra) return;
        if (extra.percent) subtotal += subtotal * extra.percent;
        if (extra.fixed) subtotal += extra.fixed;
        if (extra.areaRate) subtotal += area * extra.areaRate;
      });

      return {
        area,
        estimate: subtotal,
        low: subtotal * 0.9,
        high: subtotal * 1.15
      };
    }

    function selectedExtraLabels() {
      return configState.extras.map((extraKey) => extrasData[extraKey].label);
    }

    function buildEnquiry(formData) {
      const pricing = calculateEstimate();
      return {
        source: 'website-configurator',
        submittedAt: new Date().toISOString(),
        lead: {
          name: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          suburb: formData.get('suburb'),
          preferredContactMethod: formData.get('contactMethod')
        },
        design: {
          product: productData[configState.product].label,
          room: roomData[configState.room],
          widthMm: configState.width,
          heightMm: configState.height,
          areaSqm: Number(pricing.area.toFixed(2)),
          finish: finishData[configState.finish].label,
          extras: selectedExtraLabels()
        },
        pricing: {
          estimate: Math.round(pricing.estimate),
          rangeLow: Math.round(pricing.low),
          rangeHigh: Math.round(pricing.high),
          formattedRange: formatRand(pricing.low) + ' - ' + formatRand(pricing.high)
        }
      };
    }

    function syncMeasurementInput(input, key, min, max) {
      const parsed = Number(input.value);
      const nextValue = Number.isFinite(parsed) ? cfgClamp(Math.round(parsed), min, max) : configState[key];
      configState[key] = nextValue;
      input.value = String(nextValue);
      updateConfigurator();
    }

    function updateConfigurator() {
      const product = productData[configState.product];
      const room = roomData[configState.room];
      const finish = finishData[configState.finish];
      const pricing = calculateEstimate();
      const extraLabels = selectedExtraLabels();
      const widthScale = cfgClamp((configState.width - 400) / 4600, 0, 1);
      const heightScale = cfgClamp((configState.height - 400) / 3600, 0, 1);
      const productWidthBonus = ['sheer', 'blockout'].includes(configState.product) ? 8 : 0;

      document.getElementById('configProductLabel').textContent = product.label;
      document.getElementById('configRoomLabel').textContent = room;
      document.getElementById('configFinishLabel').textContent = finish.label;
      document.getElementById('configAreaLabel').textContent = pricing.area.toFixed(2) + 'm' + String.fromCharCode(178);
      document.getElementById('configExtrasLabel').textContent = extraLabels.length ? extraLabels.length + ' selected' : 'None selected';
      document.getElementById('estimateRange').textContent = formatRand(pricing.low) + ' - ' + formatRand(pricing.high);
      document.getElementById('estimateSummary').textContent = product.label + ' for a ' + room + ', ' + configState.width + 'mm x ' + configState.height + 'mm in ' + finish.label + (extraLabels.length ? ' with ' + extraLabels.join(', ') + '.' : '.');
      const summaryStrip = document.getElementById('configSummaryStrip');
      if (summaryStrip) {
        summaryStrip.textContent = product.label + ' / ' + room + ' / ' + configState.width + ' x ' + configState.height + 'mm / ' + finish.label;
      }

      if (widthInput.value !== String(configState.width)) widthInput.value = String(configState.width);
      if (heightInput.value !== String(configState.height)) heightInput.value = String(configState.height);

      if (stage && treatment) {
        stage.className = 'window-stage room-' + configState.room;
        stage.style.setProperty('--finish-color', finish.color);
        stage.style.setProperty('--finish-shadow', finish.shadow);
        stage.style.setProperty('--preview-w', (38 + (widthScale * 26) + productWidthBonus).toFixed(1) + '%');
        stage.style.setProperty('--preview-h', (38 + (heightScale * 35)).toFixed(1) + '%');
        treatment.className = 'window-treatment product-' + configState.product;
      }
    }

    configurator.querySelectorAll('input[name="configProduct"]').forEach((input) => {
      input.addEventListener('change', () => {
        configState.product = input.value;
        updateConfigurator();
      });
    });

    configurator.querySelectorAll('input[name="configRoom"]').forEach((input) => {
      input.addEventListener('change', () => {
        configState.room = input.value;
        updateConfigurator();
      });
    });

    configurator.querySelectorAll('input[name="configFinish"]').forEach((input) => {
      input.addEventListener('change', () => {
        configState.finish = input.value;
        updateConfigurator();
      });
    });

    configurator.querySelectorAll('input[name="configExtras"]').forEach((input) => {
      input.addEventListener('change', () => {
        configState.extras = Array.from(configurator.querySelectorAll('input[name="configExtras"]:checked')).map((checked) => checked.value);
        updateConfigurator();
      });
    });

    configurator.querySelectorAll('[data-measure-control]').forEach((control) => {
      const key = control.dataset.measureControl;
      const input = key === 'width' ? widthInput : heightInput;
      const min = key === 'width' ? 400 : 400;
      const max = key === 'width' ? 5000 : 4000;

      control.querySelectorAll('[data-step]').forEach((button) => {
        button.addEventListener('click', () => {
          const step = Number(button.dataset.step);
          configState[key] = cfgClamp(configState[key] + step, min, max);
          input.value = String(configState[key]);
          updateConfigurator();
        });
      });

      input.addEventListener('change', () => syncMeasurementInput(input, key, min, max));
      input.addEventListener('blur', () => syncMeasurementInput(input, key, min, max));
      input.addEventListener('input', () => {
        const parsed = Number(input.value);
        if (!Number.isFinite(parsed) || parsed < min || parsed > max) return;
        configState[key] = Math.round(parsed);
        updateConfigurator();
      });
    });

    if (leadForm) {
      leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!leadForm.checkValidity()) {
          quoteSuccess.textContent = 'Please complete the required details so we can send your estimate.';
          quoteSuccess.classList.remove('is-success');
          leadForm.reportValidity();
          return;
        }

        const enquiry = buildEnquiry(new FormData(leadForm));
        console.log('Configurator quote enquiry', enquiry);
        quoteSuccess.textContent = 'Thank you. Your design and estimate have been prepared, and we will be in touch shortly.';
        quoteSuccess.classList.add('is-success');
        leadForm.reset();
      });
    }

    updateConfigurator();
  }

  /* ===============================================================
     7. FLOATING ACTIONS + WHATSAPP PREVIEW
  =============================================================== */
  const backToTopBtn = document.getElementById('backToTop');
  const whatsappPreview = document.getElementById('whatsappPreview');
  const whatsappOpeners = document.querySelectorAll('[data-whatsapp-open], a[href*="wa.me"]:not([data-whatsapp-direct])');
  const whatsappClosers = document.querySelectorAll('[data-whatsapp-close]');
  let whatsappReturnFocus = null;
  let whatsappCloseTimer = null;

  function updateBackToTopVisibility() {
    if (!backToTopBtn) return;
    const shouldShow = window.scrollY > 520;
    backToTopBtn.classList.toggle('is-visible', shouldShow);
    backToTopBtn.setAttribute('aria-hidden', String(!shouldShow));
    backToTopBtn.tabIndex = shouldShow ? 0 : -1;
  }

  function openWhatsAppPreview(trigger) {
    if (!whatsappPreview) return;
    whatsappReturnFocus = trigger || document.activeElement;
    window.clearTimeout(whatsappCloseTimer);
    whatsappPreview.hidden = false;
    requestAnimationFrame(() => whatsappPreview.classList.add('is-open'));
    const directLink = whatsappPreview.querySelector('[data-whatsapp-direct]');
    if (directLink) directLink.focus({ preventScroll: true });
  }

  function closeWhatsAppPreview() {
    if (!whatsappPreview || whatsappPreview.hidden) return;
    whatsappPreview.classList.remove('is-open');
    whatsappCloseTimer = window.setTimeout(() => {
      whatsappPreview.hidden = true;
    }, 360);
    if (whatsappReturnFocus && typeof whatsappReturnFocus.focus === 'function') {
      whatsappReturnFocus.focus({ preventScroll: true });
    }
  }

  if (backToTopBtn) {
    updateBackToTopVisibility();
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  whatsappOpeners.forEach((opener) => {
    opener.addEventListener('click', (e) => {
      e.preventDefault();
      openWhatsAppPreview(opener);
    });
  });

  whatsappClosers.forEach((closer) => {
    closer.addEventListener('click', closeWhatsAppPreview);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWhatsAppPreview();
  });

  document.addEventListener('pointerdown', (e) => {
    if (!whatsappPreview || whatsappPreview.hidden) return;
    const clickedPreview = whatsappPreview.contains(e.target);
    const clickedOpener = e.target.closest('[data-whatsapp-open], a[href*="wa.me"]');
    if (!clickedPreview && !clickedOpener) closeWhatsAppPreview();
  });
  /* ===============================================================
     6. CONTACT FORM — UI ONLY, NO BACKEND
     ---------------------------------------------------------------
     Prevents the default page reload and shows a friendly confirmation
     message. Replace this with a real submission handler (e.g. fetch
     to a form service or backend) when one is available.
  =============================================================== */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      formNote.textContent = "Thanks! We've received your enquiry and will be in touch shortly.";
      contactForm.reset();
    });
  }


  /* ===============================================================
     FOOTER YEAR
  =============================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});



















