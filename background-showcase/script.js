const seasonLabels = { spring: 'Весна', summer: 'Лето', fall: 'Осень', winter: 'Зима' };
const imageBySeason = { winter: '../public/telegram/hero/winter.webp', spring: '../public/telegram/hero/spring.webp', summer: '../public/telegram/hero/summer.webp', fall: '../public/telegram/hero/fall.webp' };
const priceFormatter = new Intl.NumberFormat('ru-RU');
const grid = document.querySelector('[data-tours-grid]');
const count = document.querySelector('[data-tour-count]');
const emptyState = document.querySelector('[data-empty-state]');
const sourceNote = document.querySelector('[data-source-note]');
const status = document.querySelector('[data-data-status]');
const seasonFilter = document.querySelector('[data-season-filter]');
const typeFilter = document.querySelector('[data-type-filter]');
const resetButton = document.querySelector('[data-reset-filters]');
let tours = [];

const seasonFromId = (id) => Object.keys(seasonLabels).find((season) => id.startsWith(season + '-')) || 'other';
const formatPrice = (price) => typeof price === 'number' ? priceFormatter.format(price) + ' ₽' : 'Цена уточняется';
const difficultyLabel = { Easy: 'Легко', Medium: 'Средне', Hard: 'Сложно', Expert: 'Эксперт' };

function createTourCard(tour) {
  const season = seasonFromId(tour.id);
  const card = document.createElement('article');
  card.className = 'tour-card';
  const media = document.createElement('div'); media.className = 'tour-card-media';
  const image = document.createElement('img'); image.src = tour.imageUrl || imageBySeason[season] || imageBySeason.summer; image.alt = tour.title; image.loading = 'lazy'; media.append(image);
  const body = document.createElement('div'); body.className = 'tour-card-body';
  const top = document.createElement('div'); top.className = 'tour-card-top';
  const seasonNode = document.createElement('span'); seasonNode.className = 'tour-season'; seasonNode.textContent = seasonLabels[season] || 'Маршрут';
  const chip = document.createElement('span'); chip.className = 'difficulty-chip'; chip.textContent = difficultyLabel[tour.difficulty] || 'Маршрут'; top.append(seasonNode, chip);
  const title = document.createElement('h3'); title.textContent = tour.title;
  const subtitle = document.createElement('p'); subtitle.className = 'tour-card-subtitle'; subtitle.textContent = tour.subtitle || 'Маршрут по Приморью';
  const facts = document.createElement('div'); facts.className = 'tour-card-facts';
  const duration = document.createElement('span'); duration.textContent = tour.duration || tour.durationType;
  const price = document.createElement('span'); price.className = 'tour-price'; price.textContent = formatPrice(tour.priceRub);
  facts.append(duration, price); body.append(top, title, subtitle, facts); card.append(media, body); return card;
}

function renderTours() {
  const season = seasonFilter.value; const type = typeFilter.value;
  const filtered = tours.filter((tour) => (season === 'all' || seasonFromId(tour.id) === season) && (type === 'all' || tour.durationType === type));
  grid.replaceChildren(...filtered.map(createTourCard)); count.textContent = String(filtered.length); emptyState.hidden = filtered.length > 0; status.textContent = 'Показано маршрутов: ' + filtered.length;
}

async function loadTours() {
  try {
    const response = await fetch('./tours.json'); if (!response.ok) throw new Error('HTTP ' + response.status);
    const snapshot = await response.json(); tours = (snapshot.tours || []).filter((tour) => tour.publicationStatus === 'active');
    sourceNote.textContent = 'Snapshot: ' + snapshot.snapshotDate + ' · ' + snapshot.source; renderTours();
  } catch (error) { sourceNote.textContent = 'Каталог временно недоступен'; emptyState.hidden = false; emptyState.textContent = 'Открой витрину через локальный сервер, чтобы загрузить snapshot туров.'; count.textContent = '0'; status.textContent = 'Ошибка загрузки каталога'; console.error('[background-showcase]', error); }
}

seasonFilter.addEventListener('change', renderTours); typeFilter.addEventListener('change', renderTours);
resetButton.addEventListener('click', () => { seasonFilter.value = 'all'; typeFilter.value = 'all'; renderTours(); });
loadTours();
