'use strict';
(() => {
  const screen = document.querySelector('#loading-screen');
  const image = document.querySelector('#loading-animation');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cycleDuration = 9840;
  let timer, objectURL, request;
  let sequence = 0;
  let previousFocus;
  let replay = false;
  let cachedAnimation;

  function close() {
    sequence++;
    clearTimeout(timer);
    request?.abort();
    screen.close();
    document.documentElement.classList.remove('loading-open');
    image.onload = null;
    image.onerror = null;
    image.src = 'assets/bounce-loading-still.jpg';
    if (objectURL) URL.revokeObjectURL(objectURL);
    objectURL = null;
    if (replay && previousFocus) previousFocus.focus({preventScroll:true});
  }

  async function show(isReplay = false) {
    const current = ++sequence;
    replay = isReplay;
    previousFocus = document.activeElement;
    clearTimeout(timer);
    image.src = 'assets/bounce-loading-still.jpg';
    document.documentElement.classList.add('loading-open');
    screen.showModal();
    if (motion.matches) { timer = setTimeout(close, 500); return; }
    request = new AbortController();
    // Network failure must not leave visitors trapped in the introduction.
    timer = setTimeout(close, 15000);
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
        // One full forward-and-reverse cycle; no artificial progress indicator.
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


