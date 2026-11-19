const categories = [
  { id: 'mystery', name: 'Misterios y secretos', icon: '◈' },
  { id: 'ufo', name: 'OVNIs y paranormal', icon: '✧' },
  { id: 'references', name: 'Referencias GTA', icon: '↗' },
  { id: 'locations', name: 'Lugares especiales', icon: '⌖' },
  { id: 'collectibles', name: 'Coleccionables', icon: '◆' },
  { id: 'wildlife', name: 'Fauna', icon: '♧' },
  { id: 'activities', name: 'Actividades', icon: '◎' }
];

// Intentionally empty: only add locations supported by verifiable evidence.
// Coordinates are percentages (0–100) relative to the official map image.
const discoveries = [];
const STORAGE_KEY = 'leonida-atlas-found-v1';
const state = {
  category: 'all', selected: null, found: loadFound(), zoom: 1,
  x: 0, y: 0, drag: false, lastPointer: null
};
const $ = id => document.getElementById(id);
const filters = $('filters');
const markers = $('markers');
const canvas = $('mapCanvas');
const viewport = $('mapViewport');
const mapImage = $('officialMap');

function loadFound() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveFound() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.found])); }
  catch { /* Progress remains usable for this page session if storage is unavailable. */ }
}

function renderFilters() {
  filters.replaceChildren();
  const options = [{ id: 'all', name: 'Todos los marcadores', icon: '▦' }, ...categories];
  options.forEach(category => {
    const count = category.id === 'all'
      ? discoveries.length
      : discoveries.filter(item => item.category === category.id).length;
    const button = document.createElement('button');
    button.className = `filter ${state.category === category.id ? 'active' : ''}`;
    button.type = 'button';
    button.setAttribute('aria-pressed', String(state.category === category.id));
    const icon = document.createElement('span');
    icon.className = 'ico';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = category.icon;
    const label = document.createElement('span');
    label.className = 'filter-name';
    label.textContent = category.name;
    const total = document.createElement('span');
    total.className = 'count';
    total.textContent = String(count);
    button.append(icon, label, total);
    button.addEventListener('click', () => {
      state.category = category.id;
      renderFilters();
      renderMarkers();
    });
    filters.append(button);
  });
}

function visibleDiscoveries() {
  const query = $('search').value.trim().toLocaleLowerCase('es');
  return discoveries.filter(item => {
    const matchesCategory = state.category === 'all' || item.category === state.category;
    const searchable = `${item.title} ${item.description} ${item.area}`.toLocaleLowerCase('es');
    return matchesCategory && (!query || searchable.includes(query));
  });
}

function renderMarkers() {
  markers.replaceChildren();
  visibleDiscoveries().forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `marker ${item.status} ${state.selected === item.id ? 'selected' : ''}`;
    button.style.left = `${item.x}%`;
    button.style.top = `${item.y}%`;
    button.title = item.title;
    button.setAttribute('aria-label', `Ver ${item.title}`);
    button.addEventListener('click', () => selectDiscovery(item.id));
    markers.append(button);
  });
  $('markerCount').textContent = `${visibleDiscoveries().length} ${visibleDiscoveries().length === 1 ? 'MARCADOR VISIBLE' : 'MARCADORES VISIBLES'}`;
}

function selectDiscovery(id) {
  const item = discoveries.find(discovery => discovery.id === id);
  if (!item) return;
  state.selected = id;
  $('emptyDetail').classList.add('hidden');
  $('detailContent').classList.remove('hidden');
  $('detailTitle').textContent = item.title;
  $('detailSubtitle').textContent = item.area || 'Leonida';
  $('detailCategory').textContent = categories.find(category => category.id === item.category)?.name || item.category;
  $('detailStatus').textContent = ({ confirmed: 'CONFIRMADO', official: 'MATERIAL OFICIAL', theory: 'NO VERIFICADO' })[item.status] || 'PENDIENTE';
  $('detailDescription').textContent = item.description;
  const source = $('detailSource');
  source.href = item.source || '#';
  source.textContent = item.source ? 'Consultar fuente ↗' : 'Fuente pendiente';
  const button = $('foundBtn');
  const updateFoundButton = () => {
    const isFound = state.found.has(id);
    button.classList.toggle('done', isFound);
    button.textContent = isFound ? '✓ DESCUBIERTO' : '✓ MARCAR COMO DESCUBIERTO';
  };
  updateFoundButton();
  button.onclick = () => {
    if (state.found.has(id)) state.found.delete(id);
    else state.found.add(id);
    saveFound();
    updateProgress();
    updateFoundButton();
  };
  renderMarkers();
}

function updateProgress() {
  const total = discoveries.length;
  const found = discoveries.filter(item => state.found.has(item.id)).length;
  const percent = total ? Math.round(found / total * 100) : 0;
  $('progressText').textContent = `${found} / ${total}`;
  $('progressBar').style.width = `${percent}%`;
  $('progressPercent').textContent = `${percent}% descubierto`;
}

function applyTransform() {
  canvas.style.transform = `translate(calc(-50% + ${state.x}px), calc(-50% + ${state.y}px)) scale(${state.zoom})`;
  $('zoomLabel').textContent = `${Math.round(state.zoom * 100)}%`;
}
function zoomTo(nextZoom, pointer) {
  const zoom = Math.min(4, Math.max(0.5, nextZoom));
  if (pointer) {
    const rect = viewport.getBoundingClientRect();
    const px = pointer.x - (rect.left + rect.width / 2);
    const py = pointer.y - (rect.top + rect.height / 2);
    state.x = px - (px - state.x) * zoom / state.zoom;
    state.y = py - (py - state.y) * zoom / state.zoom;
  }
  state.zoom = zoom;
  applyTransform();
}
function resetView() {
  state.zoom = 1;
  state.x = 0;
  state.y = 0;
  applyTransform();
}
function fitMapToImage() {
  if (!mapImage.naturalWidth || !mapImage.naturalHeight) return;
  const width = Math.min(1200, Math.max(760, viewport.clientWidth * 0.9));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${width * mapImage.naturalHeight / mapImage.naturalWidth}px`;
}

$('zoomIn').addEventListener('click', () => zoomTo(state.zoom + 0.2));
$('zoomOut').addEventListener('click', () => zoomTo(state.zoom - 0.2));
$('resetView').addEventListener('click', resetView);
$('clearFilters').addEventListener('click', () => {
  state.category = 'all';
  $('search').value = '';
  renderFilters();
  renderMarkers();
  $('search').focus();
});
$('search').addEventListener('input', renderMarkers);
$('aboutBtn').addEventListener('click', () => $('modal').showModal());
$('addInfoBtn').addEventListener('click', () => $('modal').showModal());
$('closeModal').addEventListener('click', () => $('modal').close());
$('fullscreen').addEventListener('click', () => {
  if (viewport.requestFullscreen) viewport.requestFullscreen();
});
viewport.addEventListener('wheel', event => {
  event.preventDefault();
  zoomTo(state.zoom + (event.deltaY < 0 ? 0.12 : -0.12), { x: event.clientX, y: event.clientY });
}, { passive: false });
viewport.addEventListener('pointerdown', event => {
  if (event.target.closest('.marker')) return;
  state.drag = true;
  state.lastPointer = { x: event.clientX, y: event.clientY };
  viewport.classList.add('dragging');
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener('pointermove', event => {
  if (!state.drag || !state.lastPointer) return;
  state.x += event.clientX - state.lastPointer.x;
  state.y += event.clientY - state.lastPointer.y;
  state.lastPointer = { x: event.clientX, y: event.clientY };
  applyTransform();
});
function stopDrag() {
  state.drag = false;
  state.lastPointer = null;
  viewport.classList.remove('dragging');
}
viewport.addEventListener('pointerup', stopDrag);
viewport.addEventListener('pointercancel', stopDrag);
document.addEventListener('keydown', event => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $('search').focus();
  }
  if (event.key === '+' || event.key === '=') zoomTo(state.zoom + 0.2);
  if (event.key === '-') zoomTo(state.zoom - 0.2);
  if (event.key === '0') resetView();
  if (event.key === 'Escape' && $('modal').open) $('modal').close();
});
mapImage.addEventListener('load', () => {
  canvas.classList.add('has-map');
  fitMapToImage();
});
mapImage.addEventListener('error', () => canvas.classList.remove('has-map'));
window.addEventListener('resize', fitMapToImage);
renderFilters();
renderMarkers();
updateProgress();
applyTransform();
