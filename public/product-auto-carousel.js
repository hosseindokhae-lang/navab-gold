(()=>{
'use strict';
const STYLE_ID='navab-product-auto-carousel-style';
const ROOT_ID='navab-product-auto-carousel';
let mounted=null;

function hasProductImage(el){return !!el.querySelector?.('img');}
function scoreContainer(el){
  if(!el||el===document.body||el===document.documentElement)return 0;
  const children=[...el.children].filter(x=>x.nodeType===1);
  if(children.length<4||children.length>30)return 0;
  const imageChildren=children.filter(hasProductImage);
  if(imageChildren.length<4)return 0;
  const rect=el.getBoundingClientRect();
  if(rect.width<250)return 0;
  const text=(el.textContent||'').trim();
  let score=imageChildren.length*20;
  if(/مشاهده|محصول|انگشتر|گردنبند|دستبند|گوشواره|آویز|پلاک|زنجیر/i.test(text))score+=35;
  if(rect.height<900)score+=10;
  return score;
}
function findContainer(){
  const all=[...document.querySelectorAll('section,main,div,ul')];
  let best=null,bestScore=0;
  for(const el of all){
    const s=scoreContainer(el);
    if(s>bestScore){best=el;bestScore=s}
  }
  return best;
}
function addStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');style.id=STYLE_ID;
  style.textContent=`
#${ROOT_ID}{position:relative;width:100%;overflow:hidden;direction:ltr;touch-action:pan-y;}
#${ROOT_ID} .navab-product-track{display:flex!important;flex-wrap:nowrap!important;align-items:stretch!important;gap:16px!important;width:max-content!important;direction:ltr!important;will-change:transform;animation:navabProductMarquee var(--navab-speed,38s) linear infinite;}
#${ROOT_ID} .navab-product-item{flex:0 0 clamp(210px,25vw,290px)!important;width:clamp(210px,25vw,290px)!important;min-width:clamp(210px,25vw,290px)!important;}
#${ROOT_ID}:hover .navab-product-track,#${ROOT_ID}.is-touching .navab-product-track{animation-play-state:paused;}
@keyframes navabProductMarquee{from{transform:translateX(0)}to{transform:translateX(calc(-50% - 8px))}}
@media(max-width:700px){#${ROOT_ID} .navab-product-track{gap:10px!important;animation-duration:32s}.navab-product-item{flex-basis:72vw!important;width:72vw!important;min-width:72vw!important}}
@media(prefers-reduced-motion:reduce){#${ROOT_ID} .navab-product-track{animation:none!important;overflow-x:auto!important}}
`;
  document.head.appendChild(style);
}
function mount(){
  if(mounted&&document.contains(mounted))return true;
  const source=findContainer();
  if(!source||source.closest('#'+ROOT_ID))return false;
  const children=[...source.children].filter(x=>x.nodeType===1&&hasProductImage(x));
  if(children.length<4)return false;
  addStyle();
  const root=document.createElement('div');root.id=ROOT_ID;root.setAttribute('aria-label','محصولات نواب گلد');
  const track=document.createElement('div');track.className='navab-product-track';
  const fragment=document.createDocumentFragment();
  children.forEach((card)=>{card.classList.add('navab-product-item');fragment.appendChild(card)});
  track.appendChild(fragment);
  children.forEach((card)=>{
    const clone=card.cloneNode(true);clone.classList.add('navab-product-item');clone.setAttribute('aria-hidden','true');
    clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
    track.appendChild(clone);
  });
  root.appendChild(track);
  source.replaceWith(root);
  mounted=root;
  let startX=0;
  root.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;root.classList.add('is-touching')},{passive:true});
  root.addEventListener('touchend',e=>{root.classList.remove('is-touching');if(Math.abs(e.changedTouches[0].clientX-startX)>12){track.style.animationPlayState='paused';setTimeout(()=>track.style.animationPlayState='',1200)}},{passive:true});
  return true;
}
function boot(){
  let tries=0;
  const timer=setInterval(()=>{tries++;if(mount()||tries>30)clearInterval(timer)},500);
  const observer=new MutationObserver(()=>{if(!mounted||!document.contains(mounted))setTimeout(mount,100)});
  observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();