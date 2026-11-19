const categories = [
  {id:'mystery',name:'Misterios y secretos',icon:'◈'},
  {id:'ufo',name:'OVNIs y paranormal',icon:'✧'},
  {id:'references',name:'Referencias GTA',icon:'↗'},
  {id:'locations',name:'Lugares especiales',icon:'⌖'},
  {id:'collectibles',name:'Coleccionables',icon:'◆'},
  {id:'wildlife',name:'Fauna',icon:'♧'},
  {id:'activities',name:'Actividades',icon:'◎'}
];
// Empty by design: no unverified or invented GTA VI locations are preloaded.
// Add only evidence-backed entries, with normalized x/y coordinates from 0 to 100.
const discoveries = [];
const state = {category:'all',selected:null,found:new Set(),zoom:1,x:0,y:0,drag:false};
const $ = id => document.getElementById(id);
const filters = $('filters'), markers = $('markers'), canvas = $('mapCanvas'), viewport = $('mapViewport');
function renderFilters(){
  filters.innerHTML = '';
  const all = document.createElement('button');
  all.className = `filter ${state.category==='all'?'active':''}`;
  all.innerHTML = `<span class="ico">▦</span> Todos los marcadores <span class="count">${discoveries.length}</span>`;
  all.onclick=()=>{state.category='all';renderFilters();renderMarkers()};
  filters.append(all);
  categories.forEach(c=>{
    const count=discoveries.filter(d=>d.category===c.id).length;
    const b=document.createElement('button');b.className=`filter ${state.category===c.id?'active':''}`;
    b.innerHTML=`<span class="ico">${c.icon}</span>${c.name}<span class="count">${count}</span>`;
    b.onclick=()=>{state.category=c.id;renderFilters();renderMarkers()};filters.append(b);
  });
}
function visible(){const q=$('search').value.trim().toLowerCase();return discoveries.filter(d=>(state.category==='all'||d.category===state.category)&&(!q||(d.title+' '+d.description+' '+d.area).toLowerCase().includes(q)))}
function renderMarkers(){
  markers.innerHTML='';
  visible().forEach(d=>{
    const b=document.createElement('button');b.className=`marker ${d.status} ${state.selected===d.id?'selected':''}`;
    b.style.left=d.x+'%';b.style.top=d.y+'%';b.title=d.title;b.setAttribute('aria-label',d.title);
    b.onclick=()=>select(d.id);markers.append(b);
  });
  $('markerCount').textContent=`${visible().length} MARCADORES VISIBLES`;
}
function select(id){
  state.selected=id;const d=discoveries.find(x=>x.id===id);if(!d)return;
  $('emptyDetail').classList.add('hidden');$('detailContent').classList.remove('hidden');
  $('detailTitle').textContent=d.title;$('detailSubtitle').textContent=d.area||'Leonida';
  $('detailCategory').textContent=(categories.find(c=>c.id===d.category)||{}).name||d.category;
  $('detailStatus').textContent=({confirmed:'CONFIRMADO',official:'MATERIAL OFICIAL',theory:'NO VERIFICADO'})[d.status];
  $('detailDescription').textContent=d.description;
  $('detailSource').href=d.source||'#';$('detailSource').textContent=d.source?'Consultar fuente ↗':'Fuente pendiente';
  const btn=$('foundBtn'),done=state.found.has(id);btn.classList.toggle('done',done);btn.textContent=done?'✓ DESCUBIERTO':'✓ MARCAR COMO DESCUBIERTO';
  btn.onclick=()=>{done?state.found.delete(id):state.found.add(id);updateProgress();select(id)};
  renderMarkers();
}
function updateProgress(){const total=discoveries.length,found=state.found.size,pct=total?Math.round(found/total*100):0;$('progressText').textContent=`${found} / ${total}`;$('progressBar').style.width=pct+'%';$('progressPercent').textContent=pct+'% descubierto'}
function applyTransform(){canvas.style.transform=`translate(calc(-50% + ${state.x}px),calc(-50% + ${state.y}px)) scale(${state.zoom})`;$('zoomLabel').textContent=Math.round(state.zoom*100)+'%'}
function zoom(delta){state.zoom=Math.min(4,Math.max(.5,state.zoom+delta));applyTransform()}
$('zoomIn').onclick=()=>zoom(.15);$('zoomOut').onclick=()=>zoom(-.15);
$('resetView').onclick=()=>{state.zoom=1;state.x=0;state.y=0;applyTransform()};
$('clearFilters').onclick=()=>{state.category='all';$('search').value='';renderFilters();renderMarkers()};
$('search').addEventListener('input',renderMarkers);
$('aboutBtn').onclick=()=> $('modal').showModal();
$('addInfoBtn').onclick=()=> $('modal').showModal();
$('closeModal').onclick=()=> $('modal').close();
$('fullscreen').onclick=()=>{if(viewport.requestFullscreen)viewport.requestFullscreen()};
viewport.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?.1:-.1)},{passive:false});
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.marker'))return;state.drag=true;state.startX=e.clientX-state.x;state.startY=e.clientY-state.y;viewport.classList.add('dragging');viewport.setPointerCapture(e.pointerId)});
viewport.addEventListener('pointermove',e=>{if(!state.drag)return;state.x=e.clientX-state.startX;state.y=e.clientY-state.startY;applyTransform()});
function stopDrag(){state.drag=false;viewport.classList.remove('dragging')}
viewport.addEventListener('pointerup',stopDrag);viewport.addEventListener('pointercancel',stopDrag);
document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();$('search').focus()}if(e.key==='Escape'&&$('modal').open)$('modal').close()});
$('officialMap').addEventListener('load',()=>canvas.classList.add('has-map'));
$('officialMap').addEventListener('error',()=>canvas.classList.remove('has-map'));
renderFilters();renderMarkers();updateProgress();applyTransform();
