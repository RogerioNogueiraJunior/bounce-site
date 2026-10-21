'use strict';

// Add only verified business contact details supplied by Bounce.
const CONTACT = {
  whatsapp: '5511933527544',
  email: 'contato.bounce312@gmail.com',
};

const genreCopy = {
  Trap:
    'Beats de trap desenvolvidos a partir das suas referências, com definição de andamento, melodia e programação rítmica. Envie uma gravação de referência, se disponível.',
  Rap:
    'Instrumentais de rap com arranjos e elementos rítmicos adequados à interpretação vocal. Compartilhe as referências e o andamento desejado.',
  EDM:
    'Produção de música eletrônica com programação de bateria, baixo e sintetizadores. Informe o subgênero, o andamento e as referências do projeto.',
  FUNK:
    'Beats de funk pra estourar no baile, Compartilhe as referências e o andamento desejado.'
};

// Feed automático dos reels do Instagram (@bounce_312).
const INSTAGRAM = {
  profile: 'https://www.instagram.com/bounce_312/',
  feedUrl: 'https://feeds.behold.so/eZ1ldsapc1zrEsHMStXq',
  maxReels: 12,
  onlyVideos: true,
  manualReels: [],
};

let selectedGenre = 'Trap';

const genreSelect = document.querySelector('#genre');
const serviceSelect = document.querySelector('#service');
const dialog = document.querySelector('#brief-dialog');
const form = document.querySelector('#brief-form');

function selectGenre(genre) {
  if (!Object.hasOwn(genreCopy, genre)) {
    throw new Error('Estilo inválido. Escolha Trap, Rap ou EDM.');
  }

  selectedGenre = genre;

  document.querySelectorAll('[data-genre]').forEach((button) => {
    const active = button.dataset.genre === genre;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  document.querySelector('#beat-description').textContent = genreCopy[genre];
  document.querySelector('#beat-request').textContent = `Consultar beat de ${genre.toLowerCase()}`;
  genreSelect.value = genre;

  return { genre, description: genreCopy[genre] };
}

function startBrief(service, genre) {
  if (![...serviceSelect.options].some((option) => option.value === service)) {
    throw new Error('Serviço inválido.');
  }

  if (genre) {
    selectGenre(genre);
  }

  serviceSelect.value = service;
  document.querySelector('#contato').scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });

  return { service, genre: genreSelect.value, sent: false };
}

document.querySelectorAll('[data-genre]').forEach((button) => {
  button.addEventListener('click', () => selectGenre(button.dataset.genre));
});

document.querySelectorAll('[data-service]').forEach((button) => {
  button.addEventListener('click', () => startBrief(button.dataset.service));
});

document.querySelector('#beat-request').addEventListener('click', () => {
  startBrief('Beat sob medida', selectedGenre);
});

document.querySelectorAll('.service-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      document.querySelectorAll('.service-list details').forEach((other) => {
        if (other !== item) {
          other.open = false;
        }
      });
    }
  });
});

if (CONTACT.whatsapp || CONTACT.email) {
  document.querySelector('#contact-notice').textContent =
    'Você poderá revisar sua mensagem antes de enviá-la. O envio será feito pelo seu aplicativo de contato.';
  document.querySelector('#submit-label').textContent = CONTACT.whatsapp
    ? 'Continuar no WhatsApp'
    : 'Continuar por e-mail';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const data = new FormData(form);
  const text = `Olá, Bounce! Gostaria de solicitar um orçamento.\n\nNome: ${data
    .get('name')
    .trim()}\nE-mail: ${data.get('email').trim()}\nServiço: ${data.get('service')}\nEstilo: ${data.get(
    'genre'
  )}\n\nDescrição do projeto:\n${data.get('idea').trim()}`;

  if (CONTACT.whatsapp) {
    window.open(
      `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
    document.querySelector('#form-status').textContent =
      'Continue no WhatsApp para revisar e enviar seu pedido.';
  } else if (CONTACT.email) {
    location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      'Novo projeto — Bounce'
    )}&body=${encodeURIComponent(text)}`;
    document.querySelector('#form-status').textContent =
      'Revise e envie o pedido no seu aplicativo de e-mail.';
  } else {
    document.querySelector('#brief-output').value = text;
    document.querySelector('#copy-status').textContent = '';
    dialog.showModal();
  }
});

document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());

dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) {
    return;
  }

  const rect = dialog.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  ) {
    dialog.close();
  }
});

document.querySelector('#copy-brief').addEventListener('click', async () => {
  const output = document.querySelector('#brief-output');

  try {
    await navigator.clipboard.writeText(output.value);
    document.querySelector('#copy-status').textContent =
      'Pedido copiado. Nenhuma mensagem foi enviada.';
  } catch {
    output.focus();
    output.select();
    document.querySelector('#copy-status').textContent =
      'Selecione e copie o texto acima, ou baixe o resumo.';
  }
});

document.querySelector('#download-brief').addEventListener('click', () => {
  const url = URL.createObjectURL(
    new Blob([document.querySelector('#brief-output').value], {
      type: 'text/plain;charset=utf-8',
    })
  );

  const link = document.createElement('a');
  link.href = url;
  link.download = 'meu-projeto-bounce.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  document.querySelector('#copy-status').textContent =
    'Download do resumo iniciado. Nenhum pedido foi enviado.';
});

// ---------- Reels do Instagram ----------
const reelsTrack = document.querySelector('#reels-track');
const reelsPrev = document.querySelector('#reels-prev');
const reelsNext = document.querySelector('#reels-next');

function buildReelCard(post) {
  const thumb = post.thumbnailUrl || post.sizes?.medium?.mediaUrl || post.mediaUrl;
  if (!post.permalink || !thumb) {
    return null;
  }

  const caption = (post.caption || '').trim();
  const item = document.createElement('li');
  item.className = 'reel-item';

  const link = document.createElement('a');
  link.className = 'reel-card';
  link.href = post.permalink;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', caption ? `Ver reel no Instagram: ${caption.slice(0, 80)}` : 'Ver reel no Instagram');

  const img = document.createElement('img');
  img.src = thumb;
  img.alt = '';
  img.loading = 'lazy';
  img.width = 360;
  img.height = 640;

  const play = document.createElement('span');
  play.className = 'reel-play';
  play.setAttribute('aria-hidden', 'true');
  play.textContent = '▶';

  link.append(img, play);

  if (caption) {
    const cap = document.createElement('span');
    cap.className = 'reel-caption';
    cap.textContent = caption;
    link.append(cap);
  }

  item.append(link);
  return item;
}

function updateReelsControls() {
  const max = reelsTrack.scrollWidth - reelsTrack.clientWidth - 2;
  const overflows = reelsTrack.scrollWidth > reelsTrack.clientWidth + 2;
  reelsPrev.parentElement.hidden = !overflows;
  reelsPrev.disabled = reelsTrack.scrollLeft <= 2;
  reelsNext.disabled = reelsTrack.scrollLeft >= max;
}

function scrollReels(direction) {
  reelsTrack.scrollBy({
    left: direction * reelsTrack.clientWidth * 0.85,
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}

function buildEmbedCard(url) {
  const match = String(url).match(/instagram\.com\/(?:[^/]+\/)?(reels?|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!match) {
    return null;
  }

  const kind = match[1] === 'p' ? 'p' : 'reel';
  const item = document.createElement('li');
  item.className = 'reel-item reel-item--embed';

  const frame = document.createElement('iframe');
  frame.src = `https://www.instagram.com/${kind}/${match[2]}/embed`;
  frame.title = 'Reel do Instagram da Bounce';
  frame.loading = 'lazy';
  frame.allowFullscreen = true;
  frame.setAttribute('scrolling', 'no');

  item.append(frame);
  return item;
}

async function loadReels() {
  if (!INSTAGRAM.feedUrl && INSTAGRAM.manualReels.length) {
    const cards = INSTAGRAM.manualReels
      .slice(0, INSTAGRAM.maxReels)
      .map(buildEmbedCard)
      .filter(Boolean);

    if (cards.length) {
      reelsTrack.replaceChildren(...cards);
      updateReelsControls();
    }
    return;
  }

  if (!INSTAGRAM.feedUrl) {
    console.warn('[Reels] INSTAGRAM.feedUrl está vazio no app.js. Cole a Feed URL do Behold.');
    return;
  }

  try {
    const response = await fetch(INSTAGRAM.feedUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    const posts = Array.isArray(json) ? json : json.posts || [];
    const videos = posts.filter((post) => post.mediaType === 'VIDEO');
    
    const source = INSTAGRAM.onlyVideos && videos.length ? videos : posts;
    const cards = source
      .slice(0, INSTAGRAM.maxReels)
      .map(buildReelCard)
      .filter(Boolean);

    if (cards.length) {
      reelsTrack.replaceChildren(...cards);
      reelsTrack.scrollLeft = 0;
      updateReelsControls();
    }
  } catch (error) {
    console.warn('[Reels] Não foi possível carregar o feed:', error);
  }
}

reelsPrev.addEventListener('click', () => scrollReels(-1));
reelsNext.addEventListener('click', () => scrollReels(1));
reelsTrack.addEventListener('scroll', updateReelsControls, { passive: true });
window.addEventListener('resize', updateReelsControls);
reelsTrack.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    scrollReels(1);
  } else if (event.key === 'ArrowLeft') {
    scrollReels(-1);
  }
});

updateReelsControls();
loadReels();

// ---------- Carrossel da página inicial ----------
const heroCarousel = document.querySelector('#hero-carousel');

if (heroCarousel) {
  const HERO_INTERVAL = 5000;
  const HERO_TRANSITION = 800;
  const allSlides = [...heroCarousel.querySelectorAll('.hero-slide')];
  
  // CORREÇÃO: Cria o elemento de pontos do carrossel caso ele não exista no HTML
  let dotsBox = heroCarousel.querySelector('.hero-dots');
  if (!dotsBox) {
    dotsBox = document.createElement('div');
    dotsBox.className = 'hero-dots';
    heroCarousel.appendChild(dotsBox);
  }

  const mobileQuery = matchMedia('(max-width: 700px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  let slides = [];
  let current = 0;
  let busy = false;
  let focusPaused = false;
  let timer = null;
  let finishTimer = null;

  const appliesToView = (slide) =>
    !slide.dataset.view || slide.dataset.view === (mobileQuery.matches ? 'mobile' : 'desktop');

  function updateDots() {
    [...dotsBox.children].forEach((dot, index) => {
      dot.setAttribute('aria-current', String(index === current));
    });
  }

  function schedule() {
    clearTimeout(timer);
    if (document.hidden || focusPaused || slides.length < 2) {
      return;
    }
    timer = setTimeout(() => goTo((current + 1) % slides.length), HERO_INTERVAL);
  }

  function goTo(next) {
    if (busy || next === current || !slides[next]) {
      return;
    }

    const leaving = slides[current];
    const entering = slides[next];
    const animate = !reducedMotion.matches;

    busy = true;
    clearTimeout(
