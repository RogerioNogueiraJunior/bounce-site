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
    const active = button.dataset.genre
