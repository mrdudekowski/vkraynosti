const STORAGE_KEY = 'vkrainosti-selected-map-points-v3';
const miniMap = document.querySelector('[data-mini-map]');
const largeMap = document.querySelector('[data-large-map]');
const status = document.querySelector('[data-picker-status]');
const selectedName = document.querySelector('[data-selected-name]');
const selectedPosition = document.querySelector('[data-selected-position]');
const newButton = document.querySelector('[data-point-new]');
const acceptButton = document.querySelector('[data-point-accept]');
const cancelButton = document.querySelector('[data-point-cancel]');
const clearButton = document.querySelector('[data-point-clear]');
const draftPanel = document.querySelector('[data-point-draft]');
const draftName = document.querySelector('[data-point-name]');
const draftStatus = document.querySelector('[data-point-draft-status]');
const pointList = document.querySelector('[data-point-list]');
const preview = document.querySelector('[data-point-preview]');
const gapInput = document.querySelector('[data-animation-gap]');
const loopInput = document.querySelector('[data-animation-loop]');
const { movePoint, animationDelays, cameraPosition, sourcePosition } = window.AnimationOrder || {};

if (miniMap && largeMap && pointList) {
  const fallback = { points: [{ id: crypto.randomUUID(), name: 'Мыс Тобизина', x: 36, y: 91, primary: true }], gap: 500, loop: true };
  let state = fallback;
  let draft = null;
  let addingMode = false;
  let previewTimer = null;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.points)) state = { ...fallback, ...saved };
  } catch { /* use defaults */ }

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const stopPreview = () => {
    window.clearTimeout(previewTimer);
    previewTimer = null;
    largeMap.classList.remove('map-stage--playing');
  };
  const makeMarker = (point, index) => {
    const element = document.createElement('div');
    element.className = `map-marker${point.primary ? ' map-marker--primary' : ''}`;
    const delay = animationDelays(state.points, state.gap).find(([id]) => id === point.id)?.[1] ?? index * state.gap;
    const position = cameraPosition(point);
    element.style.left = `${position.x}%`; element.style.top = `${position.y}%`; element.style.setProperty('--point-delay', `${delay}ms`);
    element.innerHTML = '<span class="map-marker__ring"></span><span class="map-marker__dot"></span><span class="map-marker__label"></span>';
    element.querySelector('.map-marker__label').textContent = point.name;
    return element;
  };
  const updateDraftControls = () => {
    draftPanel.hidden = !addingMode;
    acceptButton.disabled = !draft;
    cancelButton.disabled = !draft;
    newButton.disabled = addingMode;
    miniMap.classList.toggle('map-stage--adding', addingMode);
  };
  const renderList = () => {
    pointList.replaceChildren(...state.points.map((point, index) => {
      const row = document.createElement('div'); row.className = 'point-list__row';
      const label = document.createElement('span'); label.className = 'point-list__index'; label.textContent = String(index + 1).padStart(2, '0');
      const input = document.createElement('input'); input.type = 'text'; input.value = point.name; input.maxLength = 80; input.setAttribute('aria-label', `Название точки ${index + 1}`);
      const order = document.createElement('div'); order.className = 'point-list__order';
      const move = (direction) => { const target = index + direction; if (target < 0 || target >= state.points.length) return; stopPreview(); state.points = movePoint(state.points, index, direction); save(); render(); status.textContent = 'Очередность анимации обновлена'; };
      const up = document.createElement('button'); up.type = 'button'; up.className = 'point-list__move'; up.textContent = '↑'; up.title = 'Раньше в анимации'; up.setAttribute('aria-label', `Переместить ${point.name} раньше`); up.disabled = index === 0; up.addEventListener('click', () => move(-1));
      const down = document.createElement('button'); down.type = 'button'; down.className = 'point-list__move'; down.textContent = '↓'; down.title = 'Позже в анимации'; down.setAttribute('aria-label', `Переместить ${point.name} позже`); down.disabled = index === state.points.length - 1; down.addEventListener('click', () => move(1));
      order.append(up, down);
      const rename = document.createElement('button'); rename.type = 'button'; rename.className = 'point-list__rename'; rename.textContent = 'Сохранить';
      rename.addEventListener('click', () => { const name = input.value.trim(); if (!name) { input.focus(); return; } point.name = name; save(); render(); status.textContent = 'Название точки обновлено'; });
      row.append(label, input, rename, order); return row;
    }));
  };
  const render = () => {
    miniMap.querySelectorAll('.map-marker').forEach((item) => item.remove()); largeMap.querySelectorAll('.map-marker').forEach((item) => item.remove());
    state.points.forEach((point, index) => { miniMap.append(makeMarker(point, index)); largeMap.append(makeMarker(point, index)); });
    if (draft) miniMap.append(makeMarker(draft, state.points.length));
    renderList(); updateDraftControls(); gapInput.value = state.gap; loopInput.checked = state.loop;
    const last = state.points[state.points.length - 1]; selectedName.textContent = last?.name || 'Точка не выбрана'; selectedPosition.textContent = last ? `${last.x.toFixed(1)}% · ${last.y.toFixed(1)}%` : '—';
  };
  newButton.addEventListener('click', () => { addingMode = true; draft = null; draftName.value = ''; draftStatus.textContent = 'Кликните по мини-карте'; status.textContent = 'Режим добавления включён'; render(); });
  miniMap.addEventListener('click', (event) => {
    if (!addingMode || event.target.closest('.map-marker')) return;
    const rect = miniMap.getBoundingClientRect();
    const clicked = { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
    const source = sourcePosition(clicked);
    if (source.x < 0 || source.x > 100 || source.y < 0 || source.y > 100) { draftStatus.textContent = 'Выберите точку внутри области ландшафта'; return; }
    draft = { id: crypto.randomUUID(), name: `Точка ${state.points.length + 1}`, x: Math.max(1, Math.min(99, source.x)), y: Math.max(1, Math.min(99, source.y)), primary: state.points.length === 0 };
    draftName.value = draft.name; draftStatus.textContent = 'Проверьте положение и подтвердите точку'; status.textContent = 'Черновик точки готов'; render(); draftName.focus();
  });
  acceptButton.addEventListener('click', () => { if (!draft) return; const name = draftName.value.trim(); if (!name) { draftStatus.textContent = 'Введите название точки'; draftName.focus(); return; } draft.name = name; state.points.push(draft); draft = null; addingMode = false; status.textContent = 'Последняя точка закреплена'; save(); render(); });
  cancelButton.addEventListener('click', () => { draft = null; addingMode = false; status.textContent = 'Добавление отменено'; render(); });
  clearButton.addEventListener('click', () => { if (!window.confirm('Очистить все точки и начать заново?')) return; state.points = []; draft = null; addingMode = false; status.textContent = 'Точки очищены — можно начать заново'; save(); render(); });
  gapInput.addEventListener('change', () => { state.gap = Math.max(0, Number(gapInput.value) || 0); save(); render(); });
  loopInput.addEventListener('change', () => { state.loop = loopInput.checked; save(); });
  const playPreview = () => { largeMap.classList.remove('map-stage--playing'); void largeMap.offsetWidth; largeMap.classList.add('map-stage--playing'); const duration = state.points.length * state.gap + 1600; status.textContent = state.loop ? 'Preview запущен · повтор' : 'Preview запущен'; window.clearTimeout(previewTimer); previewTimer = window.setTimeout(() => { largeMap.classList.remove('map-stage--playing'); if (state.loop) previewTimer = window.setTimeout(playPreview, 120); }, duration); };
  preview.addEventListener('click', playPreview);
  save(); render();
  status.textContent = state.points.length ? 'Точка выбрана' : 'Нажмите на карту';
}
