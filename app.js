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

