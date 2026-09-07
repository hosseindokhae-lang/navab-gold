(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
function productFromButton(btn){const m=String(btn?.getAttribute('onclick')||'').match(/openProduct\(['\"]([^'\"]+)['\"]\)/);return m?(window.products||[]).find(p=>String(p.id)===String(m[1])):null}
function addCardWage(){
 document.querySelectorAll('#productGrid .card').forEach(card=>{
   if(card.querySelector('.ng-product-wage'))return;
   const p=productFromButton(card.querySelector('.card-contact'));if(!p)return;
   const meta=card.querySelector('.card-meta');if(!meta)return;
   const wage=Number.isFinite(Number(p.wagePercent))?Number(p.wagePercent):null;
   if(wage===null)return;
   const s=document.createElement('span');s.className='ng-product-wage';s.textContent='اجرت '+wage.toLocaleString('fa-IR')+'٪';meta.appendChild(s);
 });
}
function patchModal(){
 if(typeof window.openProduct!=='function'||window.__navabWagePatched)return;
 const original=window.openProduct;
 window.openProduct=function(id){
   original.apply(this,arguments);
   setTimeout(()=>{
     const p=(window.products||[]).find(x=>String(x.id)===String(id));
     const info=document.querySelector('#productViewContent .product-view-info');
     if(!p||!info)return;
     info.querySelector('.ng-modal-wage')?.remove();
     if(Number.isFinite(Number(p.wagePercent))){const d=document.createElement('div');d.className='ng-modal-wage';d.textContent='اجرت ساخت: '+Number(p.wagePercent).toLocaleString('fa-IR')+'٪';info.insertBefore(d,info.querySelector('.product-view-price'));}
   },20);
 };
 window.__navabWagePatched=true;
 const st=document.createElement('style');st.textContent='.ng-product-wage,.ng-modal-wage{color:#d9a566;font-weight:700}.ng-modal-wage{margin:8px 0;font-size:.9rem}';document.head.appendChild(st);
}
function boot(){addCardWage();patchModal();const grid=document.getElementById('productGrid');if(grid){new MutationObserver(()=>{addCardWage();patchModal()}).observe(grid,{childList:true,subtree:true})}setInterval(()=>{addCardWage();patchModal()},1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1000));else setTimeout(boot,1000);
})();