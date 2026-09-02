(()=>{
  const ID='navab-range-duplicate-fix';
  const labels=['10 تا 20 میلیون','20 تا 30 میلیون','30 تا 40 میلیون','40 تا 50 میلیون','50+ میلیون'];
  const norm=v=>String(v||'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[–—−]/g,'-').replace(/\s+/g,' ').trim();
  const isLabel=t=>labels.includes(norm(t));
  function clean(){
    if(document.getElementById(ID))return;
    const marks=[...document.querySelectorAll('body *')].filter(el=>isLabel(el.textContent)&&![...el.children].some(c=>isLabel(c.textContent)));
    const groups=[];
    for(const mark of marks){
      let el=mark;
      for(let i=0;i<7&&el&&el!==document.body;i++,el=el.parentElement){
        const texts=[...el.querySelectorAll('*')].filter(x=>isLabel(x.textContent)&&![...x.children].some(c=>isLabel(c.textContent)));
        const uniq=new Set(texts.map(x=>norm(x.textContent)));
        if(uniq.size>=3){groups.push(el);break;}
      }
    }
    const unique=[...new Set(groups)].filter(el=>el&&el.parentElement);
    unique.sort((a,b)=>{
      const p=a.compareDocumentPosition(b);
      return p&Node.DOCUMENT_POSITION_FOLLOWING?-1:1;
    });
    const final=[];
    for(const g of unique){
      if(final.some(x=>x.contains(g)))continue;
      if(g.parentElement&&final.some(x=>g.contains(x))){
        const idx=final.findIndex(x=>g.contains(x));
        if(idx>=0)final.splice(idx,1);
      }
      final.push(g);
    }
    if(final.length>1){
      for(const dup of final.slice(1)){
        if(dup.parentElement)dup.remove();
      }
    }
    const flag=document.createElement('meta');flag.id=ID;flag.name='navab-range-duplicate-fix';flag.content='active';document.head.appendChild(flag);
  }
  function start(){clean();let n=0;const timer=setInterval(()=>{clean();if(++n>12)clearInterval(timer)},500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
