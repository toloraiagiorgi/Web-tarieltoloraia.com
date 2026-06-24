// ── Hamburger menu ──────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.nav');

if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Share button ─────────────────────────────────────────
const shareBtn = document.querySelector('.share-btn');
const shareDropdown = document.querySelector('.share-dropdown');

if (shareBtn && shareDropdown) {
  shareBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = shareDropdown.classList.toggle('open');
    shareBtn.classList.toggle('open', isOpen);
    shareBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', () => {
    shareDropdown.classList.remove('open');
    shareBtn.classList.remove('open');
    shareBtn.setAttribute('aria-expanded', 'false');
  });

  shareDropdown.addEventListener('click', e => e.stopPropagation());

  shareDropdown.querySelectorAll('.share-option').forEach(opt => {
    opt.addEventListener('click', e => {
      e.preventDefault();
      const pageUrl = encodeURIComponent(window.location.href);
      const platform = opt.dataset.platform;
      let target = '';
      if (platform === 'facebook') {
        target = 'https://www.facebook.com/sharer/sharer.php?u=' + pageUrl;
      } else if (platform === 'whatsapp') {
        target = 'https://wa.me/?text=' + pageUrl;
      } else if (platform === 'pinterest') {
        target = 'https://pinterest.com/pin/create/button/?url=' + pageUrl;
      } else if (platform === 'instagram') {
        if (navigator.share) {
          navigator.share({ url: window.location.href }).catch(() => {});
        } else {
          target = 'https://www.instagram.com/tarieltoloraia';
        }
      }
      if (target) window.open(target, '_blank', 'noopener');
      shareDropdown.classList.remove('open');
      shareBtn.classList.remove('open');
      shareBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Auto-span wide paintings ────────────────────────────
document.querySelectorAll('.gallery-item img').forEach(img => {
  function checkRatio() {
    if (!img.naturalWidth || !img.naturalHeight) return;
    if (img.naturalWidth / img.naturalHeight > 1.5) {
      img.closest('.gallery-item').style.gridColumn = 'span 2';
    }
  }
  if (img.complete) checkRatio();
  else img.addEventListener('load', checkRatio);
});

// ── Lightbox + Navigation + Zoom ────────────────────────
const lightbox = document.getElementById('lightbox');

if (lightbox) {
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxTitle = document.querySelector('.lightbox-title');
  const lightboxSize  = document.querySelector('.lightbox-size');
  const lightboxTech  = document.querySelector('.lightbox-technique');
  const btnPrev       = document.querySelector('.lightbox-prev');
  const btnNext       = document.querySelector('.lightbox-next');

  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  let currentIndex   = 0;

  // ── Zoom state ─────────────────────────────────────────
  let scale = 1, panX = 0, panY = 0;
  let isDragging = false, hasDragged = false;
  let dragStartX, dragStartY;
  let initPinchDist = 0, initPinchScale = 1;
  const MAX_SCALE = 5;

  function applyZoom(animate) {
    lightboxImg.style.transition = animate ? 'transform 0.2s ease' : 'none';
    lightboxImg.style.transform  = scale === 1 ? '' : `translate(${panX}px, ${panY}px) scale(${scale})`;
    lightboxImg.style.cursor     = scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in';
    const hidden = scale > 1;
    btnPrev.style.opacity       = hidden ? '0' : '';
    btnNext.style.opacity       = hidden ? '0' : '';
    btnPrev.style.pointerEvents = hidden ? 'none' : '';
    btnNext.style.pointerEvents = hidden ? 'none' : '';
  }

  function resetZoom() {
    scale = 1; panX = 0; panY = 0;
    isDragging = false; hasDragged = false;
    lightboxImg.style.transition = 'none';
    lightboxImg.style.transform  = '';
    lightboxImg.style.cursor     = 'zoom-in';
    btnPrev.style.opacity = ''; btnPrev.style.pointerEvents = '';
    btnNext.style.opacity = ''; btnNext.style.pointerEvents = '';
  }

  function showItem(index) {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    const img  = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxTitle.textContent = item.dataset.title     || '';
    lightboxSize.textContent  = item.dataset.size      || '';
    lightboxTech.textContent  = item.dataset.technique || '';
    resetZoom();
  }

  function openLightbox(item) {
    showItem(galleryItems.indexOf(item));
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    resetZoom();
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => item.addEventListener('click', () => openLightbox(item)));

  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-inner').addEventListener('click', e => e.stopPropagation());
  lightbox.addEventListener('click', closeLightbox);

  btnPrev.addEventListener('click', e => { e.stopPropagation(); showItem(currentIndex - 1); });
  btnNext.addEventListener('click', e => { e.stopPropagation(); showItem(currentIndex + 1); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showItem(currentIndex - 1);
    if (e.key === 'ArrowRight') showItem(currentIndex + 1);
  });

  // ── Scroll wheel zoom ───────────────────────────────────
  lightboxImg.addEventListener('wheel', e => {
    e.preventDefault();
    const step = e.deltaY < 0 ? 0.35 : -0.35;
    scale = Math.min(MAX_SCALE, Math.max(1, scale + step));
    if (scale === 1) { panX = 0; panY = 0; }
    applyZoom(false);
  }, { passive: false });

  // ── Click to toggle zoom ────────────────────────────────
  lightboxImg.addEventListener('click', e => {
    if (hasDragged) { hasDragged = false; return; }
    scale = scale === 1 ? 2.5 : 1;
    if (scale === 1) { panX = 0; panY = 0; }
    applyZoom(true);
  });

  // ── Mouse drag to pan ───────────────────────────────────
  lightboxImg.addEventListener('mousedown', e => {
    dragStartX = e.clientX - panX;
    dragStartY = e.clientY - panY;
    isDragging = true; hasDragged = false;
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const nx = e.clientX - dragStartX;
    const ny = e.clientY - dragStartY;
    if (Math.abs(nx - panX) > 3 || Math.abs(ny - panY) > 3) hasDragged = true;
    panX = nx; panY = ny;
    applyZoom(false);
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) { isDragging = false; applyZoom(false); }
  });

  // ── Touch: pinch-to-zoom + single-finger pan + swipe nav ─
  let swipeStartX = 0, swipeStartY = 0;

  lightboxImg.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      initPinchDist  = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      initPinchScale = scale;
      isDragging = false;
    } else if (e.touches.length === 1) {
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
      dragStartX = e.touches[0].clientX - panX;
      dragStartY = e.touches[0].clientY - panY;
      isDragging = scale > 1; hasDragged = false;
    }
    e.preventDefault();
  }, { passive: false });

  lightboxImg.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 2 && initPinchDist) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      scale = Math.min(MAX_SCALE, Math.max(1, initPinchScale * (dist / initPinchDist)));
      if (scale === 1) { panX = 0; panY = 0; }
      applyZoom(false);
    } else if (isDragging && e.touches.length === 1) {
      panX = e.touches[0].clientX - dragStartX;
      panY = e.touches[0].clientY - dragStartY;
      applyZoom(false);
    }
  }, { passive: false });

  lightboxImg.addEventListener('touchend', e => {
    isDragging = false;
    initPinchDist = 0;
    if (scale === 1 && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - swipeStartX;
      const dy = e.changedTouches[0].clientY - swipeStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        dx < 0 ? showItem(currentIndex + 1) : showItem(currentIndex - 1);
      }
    }
  });
}
