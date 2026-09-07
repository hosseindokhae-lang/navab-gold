(()=>{
'use strict';
const norm=s=>String(s||'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[–—−]/g,'-').replace(/\s+/g,' ').trim();
const labels=['10 تا 20 میلیون','20 تا 30 میلیون','30 تا 40 میلیون','40 تا 50 میلیون','50 میلیون به بالا'];
function count(t){const x=norm(t);return labels.filter(l=>x.includes(l)).length}
function clean(){
 const keep=document.getElementById('navab-price-ranges');
 const candidates=[...document.querySelectorAll('section,article,div')].filter(el=>{
   if(!el.parentElement||el===keep||el.closest('#navab-price-ranges')||el.contains(keep))return false;
   const t=norm(el.textContent);return (t.includes('محصولات بر اساس قیمت')||t.includes('انتخاب بازه'))&&count(t)>=2;
 });
 const minimal=candidates.filter(el=>!candidates.some(other=>other!==el&&el.contains(other)));
 minimal.forEach(el=>el.remove());
}
function boot(){clean();const mo=new MutationObserver(clean);mo.observe(document.body,{childList:true,subtree:true});setTimeout(()=>{clean();mo.disconnect()},10000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,700));else setTimeout(boot,700);
})();