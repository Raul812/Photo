'use strict';

(() => {
  const gallery  = document.getElementById('gallery');
  const empty    = document.getElementById('empty');
  const countEl  = document.getElementById('count');
  const topbar   = document.getElementById('topbar');

  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbDate    = document.getElementById('lb-date');
  const lbCamera  = document.getElementById('lb-camera');
  const lbCounter = document.getElementById('lb-counter');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');

  const state = { photos: [], index: -1, isOpen: false };

  const pad2 = (n) => String(n).padStart(2, '0');

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
  }

  /* ---------- 画廊渲染 ---------- */

  function createPhotoElement(photo, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo';
    button.dataset.index = String(index);
    button.setAttribute('aria-label', `查看第 ${index + 1} 张照片`);

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = '';
    img.loading = index < 3 ? 'eager' : 'lazy';
    img.decoding = 'async';
    if (photo.width && photo.height) {
      img.style.aspectRatio = `${photo.width} / ${photo.height}`;
    }

    // 【新增】注入随机动画参数，让每张图“左右浮动”的节奏错开
    const duration = (4 + Math.random() * 3).toFixed(2); // 4~7秒一个来回
    const delay = (Math.random() * 3).toFixed(2);        // 延迟 0~3 秒启动
    img.style.setProperty('--float-duration', `${duration}s`);
    img.style.setProperty('--float-delay', `${delay}s`);

    button.appendChild(img);
    return button;
  }

  function render() {
    gallery.textContent = '';

    countEl.textContent = state.photos.length
      ? `${state.photos.length} ${state.photos.length === 1 ? 'PHOTO' : 'PHOTOS'}`
      : '';

    if (!state.photos.length) {
      empty.hidden = false;
      return;
    }

    const frag = document.createDocumentFragment();
    state.photos.forEach((photo, i) => frag.appendChild(createPhotoElement(photo, i)));
    gallery.appendChild(frag);
  }

  /* ---------- 灯箱 ---------- */

  function preload(i) {
    const photo = state.photos[i];
    if (photo) new Image().src = photo.src;
  }

  function paintLightbox() {
    const photo = state.photos[state.index];
    if (!photo) return;
    lbImg.src = photo.src;
    lbDate.textContent = formatDate(photo.date);
    lbCamera.textContent = photo.camera || '';
    lbCounter.textContent = `${state.index + 1} / ${state.photos.length}`;
    preload(state.index + 1);
    preload(state.index - 1);
  }

  function openLightbox(index) {
    state.index = index;
    state.isOpen = true;
    paintLightbox();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    lbClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    state.isOpen = false;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  function step(delta) {
    const total = state.photos.length;
    if (!state.isOpen || !total) return;
    state.index = (state.index + delta + total) % total;
    paintLightbox();
  }

  /* ---------- 事件 ---------- */

  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('.photo');
    if (button) openLightbox(Number(button.dataset.index));
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => step(-1));
  lbNext.addEventListener('click', () => step(1));

  lightbox.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    if (event.target === lbImg) return;
    closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!state.isOpen) return;
    if (event.key === 'Escape') closeLightbox();
    else if (event.key === 'ArrowLeft') step(-1);
    else if (event.key === 'ArrowRight') step(1);
  });

  // 触摸滑动翻页
  let touchX = 0, touchY = 0;
  lightbox.addEventListener('touchstart', (event) => {
    if (event.touches.length !== 1) return;
    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', (event) => {
    const t = event.changedTouches[0];
    const dx = t.clientX - touchX;
    const dy = t.clientY - touchY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      step(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  /* ---------- 顶栏滚动隐藏 ---------- */

  let lastY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y > lastY && y > 80) topbar.classList.add('is-hidden');
      else topbar.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    });
  }, { passive: true });

  /* ---------- 启动 ---------- */

  async function boot() {
    try {
      const res = await fetch(`photos.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.photos = Array.isArray(data.photos) ? data.photos : [];
    } catch (err) {
      console.error(err);
      empty.hidden = false;
      empty.textContent = '照片清单加载失败。';
      return;
    }
    render();
  }

  boot();
})();