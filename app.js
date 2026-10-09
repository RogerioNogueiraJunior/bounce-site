'use strict';

// Add only verified business contact details supplied by Bounce.
const CONTACT = {
  whatsapp: '5511969537986',
  email: 'vitor.natale9@gmail.com',
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
// 1) Crie um feed gratuito em https://behold.so conectando o Instagram da Bounce.
// 2) Cole abaixo a "Feed URL" (JSON) gerada, ex.: 'https://feeds.behold.so/XXXXXXXX'.
// Enquanto estiver vazio, a seção mostra apenas o botão para o Instagram.
const INSTAGRAM = {
  profile: 'https://www.instagram.com/bounce_312/',
  feedUrl: 'https://feeds.behold.so/eZ1ldsapc1zrEsHMStXq',
  maxReels: 12,
  // true = mostra só vídeos/reels; false = mostra todos os posts do feed.
  onlyVideos: true,
  // Alternativa sem conectar conta: cole aqui os links dos reels (o mais novo primeiro).
  // Exemplo: 'https://www.instagram.com/reel/ABC123xyz/'
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
    console.info(`[Reels] O feed trouxe ${posts.length} posts, sendo ${videos.length} vídeos.`);
    const source = INSTAGRAM.onlyVideos && videos.length ? videos : posts;
    const cards = source
      .slice(0, INSTAGRAM.maxReels)
      .map(buildReelCard)
      .filter(Boolean);

    if (!cards.length) {
      console.warn('[Reels] O feed respondeu, mas não trouxe posts utilizáveis.', json);
    }

    if (cards.length) {
      reelsTrack.replaceChildren(...cards);
      reelsTrack.scrollLeft = 0;
      updateReelsControls();
    }
  } catch (error) {
    // Mantém o botão para o Instagram caso o feed falhe.
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
// Desktop: tela principal -> banner (2 telas). Celular: tela principal -> banner em 3 partes (4 telas).
// Cada tela fica 5 segundos; ao terminar o ciclo, volta para a tela principal.
const heroCarousel = document.querySelector('#hero-carousel');

if (heroCarousel) {
  const HERO_INTERVAL = 5000;
  const HERO_TRANSITION = 800;
  const allSlides = [...heroCarousel.querySelectorAll('.hero-slide')];
  const dotsBox = heroCarousel.querySelector('.hero-dots');
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
    clearTimeout(timer);

    // A nova tela espera à esquerda e entra enquanto a atual sai para a direita.
    entering.classList.add('is-entering');
    void entering.offsetWidth;

    if (animate) {
      heroCarousel.classList.add('is-animating');
    }

    leaving.classList.remove('is-active');
    leaving.classList.add('is-leaving');
    entering.classList.remove('is-entering');
    entering.classList.add('is-active');
    current = next;
    updateDots();

    finishTimer = setTimeout(
      () => {
        heroCarousel.classList.remove('is-animating');
        leaving.classList.remove('is-leaving');
        busy = false;
        schedule();
      },
      animate ? HERO_TRANSITION + 50 : 0
    );
  }

  function setupHeroCarousel() {
    clearTimeout(timer);
    clearTimeout(finishTimer);
    busy = false;
    heroCarousel.classList.remove('is-animating');

    allSlides.forEach((slide) => {
      slide.classList.remove('is-active', 'is-leaving', 'is-entering');
    });

    slides = allSlides.filter(appliesToView);
    current = 0;
    slides[0].classList.add('is-active');
    heroCarousel.classList.add('is-ready');

    dotsBox.replaceChildren(
      ...slides.map((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot';
        dot.setAttribute('aria-label', `Ir para o destaque ${index + 1} de ${slides.length}`);
        dot.addEventListener('click', () => goTo(index));
        return dot;
      })
    );
    dotsBox.hidden = slides.length < 2;

    updateDots();
    schedule();
  }

  // Pausa enquanto alguém navega por teclado dentro do carrossel.
  heroCarousel.addEventListener('focusin', (event) => {
    if (!event.target.matches(':focus-visible')) {
      return;
    }
    focusPaused = true;
    clearTimeout(timer);
  });
  heroCarousel.addEventListener('focusout', () => {
    focusPaused = false;
    schedule();
  });

  document.addEventListener('visibilitychange', schedule);
  mobileQuery.addEventListener('change', setupHeroCarousel);

  setupHeroCarousel();
}

document.querySelector('#year').textContent = new Date().getFullYear();

if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const register = (tool) => {
    try {
      Promise.resolve(document.modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(
        () => {}
      );
    } catch {
      // ignore registration errors in unsupported environments
    }
  };

  register({
    name: 'select_beat_genre',
    title: 'Selecionar estilo de beat',
    description: 'Seleciona Trap, Rap, EDM ou FUNK na página. Não compra nem envia pedidos.',
    inputSchema: {
      type: 'object',
      properties: {
        genre: {
          type: 'string',
          enum: ['Trap', 'Rap', 'EDM', 'FUNK'],
        },
      },
      required: ['genre'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    execute: (input) => selectGenre(input.genre),
  });

  register({
    name: 'start_project_brief',
    title: 'Começar pedido de orçamento',
    description: 'Abre a seção de orçamento com o serviço selecionado. Não envia o pedido.',
    inputSchema: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          enum: [...serviceSelect.options].map((option) => option.value),
        },
      },
      required: ['service'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    execute: (input) => startBrief(input.service),
  });

  window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
}

