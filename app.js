const categories = [
  {id:'mystery',name:'Misterios',icon:'◇'},
  {id:'ufo',name:'OVNI y paranormal',icon:'✦'},
  {id:'references',name:'Referencias',icon:'↗'},
  {id:'locations',name:'Lugares',icon:'⌖'},
  {id:'collectibles',name:'Coleccionables',icon:'◆'},
  {id:'wildlife',name:'Fauna',icon:'♧'},
  {id:'activities',name:'Actividades',icon:'◎'}
];

const discoveries = [];
const state = {category:'all', selected:null, zoom:1, x:0, y:0, dragging:false, found:new Set(loadFound())};
const $ = id => document.getElementById(id);
const viewport = $('mapViewport'), canvas = $('mapCanvas'), map = $('officialMap');

function loadFound(){
  try{return JSON.parse(localStorage.getItem('leonida-found')||'[]')}catch{return []}
}
function saveFound(){localStorage.setItem('leonida-found',JSON.stringify([...state.found]))}

function renderFilters(){
  const container=$('filters');container.innerHTML='';
  const all={id:'all',name:'Todos',icon:'▦'};
  [all,...categories].forEach(item=>{
    const count=item.id==='all'?discoveries.length:discoveries.filter(d=>d.category===item.id).length;
    const button=document.createElement('button');
    button.type='button';button.className=`filter ${state.category===item.id?'active':''}`;
    button.innerHTML=`<span>${item.icon}</span><b>${item.name}</b><em>${count}</em>`;
    button.onclick=()=>{state.category=item.id;renderFilters();renderMarkers()};
    container.append(button);
  });
}
function visible(){
  const q=$('search').value.trim().toLowerCase();
  return discoveries.filter(d=>(state.category==='all'||d.category===state.category)&&(!q||`${d.title} ${d.area} ${d.description}`.toLowerCase().includes(q)));
}
function renderMarkers(){
  $('markers').innerHTML='';
  visible().forEach((d,index)=>{
    const marker=document.createElement('button');
    marker.type='button';marker.className=`marker ${d.status||'open'} ${state.selected===d.id?'selected':''}`;
    marker.style.left=d.x+'%';marker.style.top=d.y+'%';marker.style.setProperty('--delay',`${index*35}ms`);
    marker.setAttribute('aria-label',d.title);marker.title=d.title;
    marker.onclick=event=>{event.stopPropagation();selectDiscovery(d)};
    $('markers').append(marker);
  });
  $('markerCount').textContent=`${visible().length} PUNTOS`;
}
function selectDiscovery(d){
  state.selected=d.id;$('emptyDetail').classList.add('hidden');$('detailContent').classList.remove('hidden');
  $('detailIndex').textContent=`REGISTRO / ${String(discoveries.indexOf(d)+1).padStart(2,'0')}`;
  $('detailCategory').textContent=(categories.find(c=>c.id===d.category)||{}).name||d.category;
  $('detailTitle').textContent=d.title;$('detailArea').textContent=d.area||'Leonida';
  $('detailDescription').textContent=d.description;
  $('detailSource').href=d.source||'#';$('detailSource').style.display=d.source?'':'none';
  updateFoundButton(d);renderMarkers();
}
function updateFoundButton(d){
  const found=state.found.has(d.id),button=$('foundBtn');
  button.textContent=found?'DESCUBIERTO ✓':'MARCAR COMO DESCUBIERTO';button.classList.toggle('found',found);
  button.onclick=()=>{found?state.found.delete(d.id):state.found.add(d.id);saveFound();updateProgress();updateFoundButton(d)};
}
function updateProgress(){
  const found=discoveries.filter(d=>state.found.has(d.id)).length;
  $('progressText').textContent=`${found} / ${discoveries.length}`;
  $('progressBar').style.width=discoveries.length?`${found/discoveries.length*100}%`:'0%';
}

let frame;
function applyTransform(){
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
    canvas.style.transform=`translate3d(calc(-50% + ${state.x}px),calc(-50% + ${state.y}px),0) scale(${state.zoom})`;
    $('zoomLabel').textContent=`${Math.round(state.zoom*100)}%`;
  });
}
function zoomTo(zoom,cx,cy){
  const next=Math.max(.55,Math.min(5,zoom));
  if(next===state.zoom)return;
  const rect=viewport.getBoundingClientRect();
  cx=cx===undefined?rect.left+rect.width/2:cx;cy=cy===undefined?rect.top+rect.height/2:cy;
  const px=cx-(rect.left+rect.width/2)-state.x,py=cy-(rect.top+rect.height/2)-state.y;
  const ratio=next/state.zoom;state.x-=px*(ratio-1);state.y-=py*(ratio-1);state.zoom=next;applyTransform();
}
function resetView(){state.zoom=1;state.x=0;state.y=0;applyTransform();showToast('Vista restablecida')}

$('zoomIn').onclick=()=>zoomTo(state.zoom+.18);
$('zoomOut').onclick=()=>zoomTo(state.zoom-.18);
$('locateBtn').onclick=resetView;$('homeBtn').onclick=resetView;
$('clearFilters').onclick=()=>{state.category='all';$('search').value='';renderFilters();renderMarkers();resetView()};
$('search').addEventListener('input',renderMarkers);

viewport.addEventListener('wheel',e=>{
  e.preventDefault();zoomTo(state.zoom+(e.deltaY<0?.12:-.12),e.clientX,e.clientY);
},{passive:false});
viewport.addEventListener('dblclick',e=>{zoomTo(state.zoom<1.8?2.4:1,e.clientX,e.clientY)});

viewport.addEventListener('pointerdown',e=>{
  if(e.target.closest('.marker'))return;state.dragging=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');
  state.startX=e.clientX-state.x;state.startY=e.clientY-state.y;
});
viewport.addEventListener('pointermove',e=>{
  if(!state.dragging)return;state.x=e.clientX-state.startX;state.y=e.clientY-state.startY;applyTransform();
});
function stopDrag(){state.dragging=false;viewport.classList.remove('dragging')}
viewport.addEventListener('pointerup',stopDrag);viewport.addEventListener('pointercancel',stopDrag);

$('fullscreenBtn').onclick=()=>{if(!document.fullscreenElement)viewport.requestFullscreen?.();else document.exitFullscreen?.()};
viewport.addEventListener('dblclick',()=>{});
document.addEventListener('keydown',e=>{
  if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();$('search').focus()}
  if(e.key==='+'||e.key==='=')zoomTo(state.zoom+.18);
  if(e.key==='-')zoomTo(state.zoom-.18);
  if(e.key==='0')resetView();
});

function fitCanvas(){
  if(!map.naturalWidth)return;
  const available=viewport.clientWidth;
  const width=Math.max(680,Math.min(1250,available*.92));
  canvas.style.width=`${width}px`;canvas.style.height=`${width*map.naturalHeight/map.naturalWidth}px`;
}
map.onload=()=>{canvas.classList.add('loaded');fitCanvas()};map.onerror=()=>canvas.classList.remove('loaded');
window.addEventListener('resize',fitCanvas);

function showToast(text){const toast=$('toast');toast.textContent=text;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),1600)}
renderFilters();renderMarkers();updateProgress();applyTransform();
