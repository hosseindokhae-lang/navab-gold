(()=>{
'use strict';
const rangeKeys=['r10_20','r20_30','r30_40','r40_50','r50_plus'];
const catKeys=['cat_ring','cat_bracelet','cat_necklace','cat_earring','cat_pendant','cat_chain'];
async function get(k){try{const r=await fetch('/api/storage/navab_image_'+encodeURIComponent(k)+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)return'';const j=await r.json();return typeof j.value==='string'?j.value:''}catch{return''}}
async function apply(){
 const keys=[...rangeKeys,...catKeys];const vals=await Promise.all(keys.map(get));
 const images={};keys.forEach((k,i)=>{if(vals[i])images[k]=vals[i]});
 const cats=[...document.querySelectorAll('#navab-category-strip .ncat-card')];cats.forEach((el,i)=>{const src=images[catKeys[i]];if(src){let im=el.querySelector('img');if(!im){const box=el.querySelector('.ncat-img');if(box){box.innerHTML='<img loading="lazy">';im=box.querySelector('img')}}if(im){im.src=src;im.style.width='100%';im.style.height='100%';im.style.objectFit='cover'}}});
 const ranges=[...document.querySelectorAll('#navab-price-ranges .nrange-card')];ranges.forEach((el,i)=>{const src=images[rangeKeys[i]];if(src){let im=el.querySelector('img');if(!im){const box=el.querySelector('.nrange-img');if(box){box.innerHTML='<img loading="lazy">';im=box.querySelector('img')}}if(im){im.src=src;im.style.width='100%';im.style.height='100%';im.style.objectFit='cover'}}});
}
function boot(){setTimeout(apply,1200);setTimeout(apply,3000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();