(()=>{
  const ID='navab-range-duplicate-fix';
  const KEEP='navab-price-ranges';
  const labels=['10 تا 20 میلیون','20 تا 30 میلیون','30 تا 40 میلیون','40 تا 50 میلیون','50+ میلیون','50 میلیون به بالا'];
  const norm=v=>String(v||'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[–—−]/g,'-').replace(/\s+/g,' ').trim();
  const isLabel=t=>labels.includes(norm(t));
  function rangeCount(el){
    const found=[...el.querySelectorAll('*')].filter(x=>isLabel(x.textContent)&&![...x.children].some(c=>isLabel(c.textContent)));
    return new Set(found.map(x=>norm(x.textContent))).size;
  }
  function clean(){
    const keep=document.getElementById(KEEP);
    const candidates=[];
    for(const el of [...document.querySelectorAll('section,article,div')]){
      if(!el.parentElement||el===keep||el.closest('#'+KEEP))continue;
      if(rangeCount(el)>=3)candidates.push(el);
    }
    // Pick the smallest meaningful container for each duplicate block.
    const blocks=[];
    for(const el of candidates){
      if(blocks.some(x=>x.contains(el)))continue;
      blocks.push(el);
    }
    // The canonical range strip is #navab-price-ranges. Any other block
    // containing the same range labels is legacy/duplicate and is removed.
    for(const block of blocks){
      if(block===keep||block.contains(keep))continue;
      if(block.parentElement)block.remove();
    }
  }
  function start(){
    clean();
    const observer=new MutationObserver(()=>clean());
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),12000);
    const flag=document.createElement('meta');flag.id=ID;flag.name=ID;flag.content='active';document.head.appendChild(flag);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
