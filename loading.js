'use strict';
(() => {
  const screen = document.querySelector('#loading-screen');
  const image = document.querySelector('#loading-animation');
  const progress = document.querySelector('.loading-progress__fill');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cycleDuration = 5000;
  let timer, objectURL, request, progressFrame;
  let sequence = 0;
  let previousFocus;
  let replay = false;
  let cachedAnimation;

  function updateProgress(value) {
    if (!progress) return;
    const normalized = Math.min(Math.max(value, 0), 1);
    progress.style.transform = `scaleX(${normalized})`;
  }

  function startProgress() {
    cancelAnimationFrame(progressFrame);
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / cycleDuration, 1);
      updateProgress(ratio);
      if (ratio < 1 && screen.open) {
        progressFrame = requestAnimationFrame(tick);
      }
    };

    progressFrame = requestAnimationFrame(tick);
  }

  function close() {
    sequence++;
    clearTimeout(timer);
    cancelAnimationFrame(progressFrame);
    request?.abort();
    screen.close();
    document.documentElement.classList.remove('loading-open');
    image.onload = null;
    image.onerror = null;
    image.src = 'assets/bounce-loading-still.jpg';
    updateProgress(0);
    if (objectURL) URL.revokeObjectURL(objectURL);
    objectURL = null;
    if (replay && previousFocus) previousFocus.focus({preventScroll:true});
  }

  async function show(isReplay = false) {
    const current = ++sequence;
    replay = isReplay;
    previousFocus = document.activeElement;
    clearTimeout(timer);
    cancelAnimationFrame(progressFrame);
    image.src = 'assets/bounce-loading-still.jpg';
    updateProgress(0);
    document.documentElement.classList.add('loading-open');
    screen.showModal();
    startProgress();
    if (motion.matches) { timer = setTimeout(close, cycleDuration); return; }
    request = new AbortController();
    timer = setTimeout(close, cycleDuration);
    try {
      if (!cachedAnimation) {
        const response = await fetch('assets/bounce-loading.gif', {signal: request.signal});
        if (!response.ok) throw new Error('Animation unavailable');
        cachedAnimation = new Blob([await response.arrayBuffer()], {type: 'image/gif'});
      }
      if (current !== sequence || !screen.open) return;
      objectURL = URL.createObjectURL(cachedAnimation);
      image.onload = () => {
        if (current !== sequence) return;
        clearTimeout(timer);
        timer = setTimeout(close, cycleDuration);
      };
      image.onerror = close;
      image.src = objectURL;
    } catch {
      if (current === sequence) close();
    }
  }
  document.querySelector('#replay-loading').addEventListener('click', () => show(true));
  screen.addEventListener('cancel', event => { event.preventDefault(); close(); });
  motion.addEventListener('change', () => { if (motion.matches && screen.open) close(); });
  show();
})();


