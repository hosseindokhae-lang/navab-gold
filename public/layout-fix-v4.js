(()=>{
  const IDS={market:'navab-market-strip',categories:'navab-category-strip',ranges:'navab-price-ranges',calc:'navab-price-calculator',products:'products'};
  const $=id=>document.getElementById(id);

  function findProducts(){
    return $(IDS.products)||document.querySelector('[id*="products" i]');
  }

  function applyLayout(){
    const products=findProducts();
    if(!products||!products.parentElement)return false;
    const host=products.parentElement;

    const market=$(IDS.market);
    const categories=$(IDS.categories);
    const ranges=$(IDS.ranges);
    const calc=$(IDS.calc);

    // All storefront blocks must live in the same main content flow as the products.
    // This prevents injected sections from being appended after the footer.
    for(const el of [market,categories,ranges,calc]){
      if(el&&el.parentElement!==host)host.insertBefore(el,products);
    }

    // Keep the requested order: live prices -> categories -> price ranges -> calculator -> products.
    const order=[market,categories,ranges,calc].filter(Boolean);
    for(const el of order)host.insertBefore(el,products);

    if(market)market.classList.add('ng-market-main');
    if(categories)categories.classList.add('ng-category-main');
    if(ranges)ranges.classList.add('ng-range-main');
    if(calc)calc.classList.add('ng-calculator-main');
    return true;
  }

  function style(){
    if(document.getElementById('ng-layout-fix-v4-style'))return;
    const s=document.createElement('style');
    s.id='ng-layout-fix-v4-style';
    s.textContent=`
      #${IDS.market}.ng-market-main{position:relative!important;z-index:5!important}
      #${IDS.categories}.ng-category-main,#${IDS.ranges}.ng-range-main{
        position:relative!important;
        z-index:4!important;
        max-width:1180px!important;
        margin-left:auto!important;
        margin-right:auto!important;
      }
      #${IDS.categories}.ng-category-main .ncat-img,
      #${IDS.ranges}.ng-range-main .nrange-img{
        background:#fff!important;
        border:1px solid rgba(120,100,75,.16)!important;
        box-shadow:0 3px 12px rgba(0,0,0,.06)!important;
      }
      #${IDS.calc}.ng-calculator-main{
        width:min(760px,calc(100% - 24px))!important;
        margin:18px auto 28px!important;
        padding:0!important;
        position:relative!important;
        z-index:6!important;
        box-sizing:border-box!important;
      }
      #${IDS.calc}.ng-calculator-main .npc-card{
        background:linear-gradient(135deg,#172338 0%,#263b58 100%)!important;
        color:#fff!important;
        border:1px solid rgba(210,170,85,.38)!important;
        border-radius:18px!important;
        box-shadow:0 12px 28px rgba(0,0,0,.18)!important;
      }
      #${IDS.calc}.ng-calculator-main .npc-title{font-size:17px!important;color:#f3d48d!important}
      #${IDS.calc}.ng-calculator-main .npc-sub{color:rgba(255,255,255,.72)!important}
      #${IDS.calc}.ng-calculator-main td{border-top-color:rgba(255,255,255,.10)!important}
      #${IDS.calc}.ng-calculator-main td:first-child{color:rgba(255,255,255,.82)!important}
      #${IDS.calc}.ng-calculator-main .npc-input{background:#fff!important;color:#202020!important}
      #${IDS.calc}.ng-calculator-main .npc-result{color:#f6d58d!important}
      #${IDS.calc}.ng-calculator-main .npc-final{background:rgba(255,255,255,.08)!important}
      #${IDS.calc}.ng-calculator-main .npc-status{color:rgba(255,255,255,.58)!important}
      @media(max-width:600px){
        #${IDS.calc}.ng-calculator-main{width:calc(100% - 16px)!important;margin:12px auto 22px!important}
        #${IDS.calc}.ng-calculator-main .npc-head{padding:13px 14px 7px!important}
        #${IDS.calc}.ng-calculator-main .npc-title{font-size:15px!important}
        #${IDS.calc}.ng-calculator-main td{padding:9px 10px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function boot(){style();applyLayout();}
  let runs=0;
  const observer=new MutationObserver(()=>{if(runs++<120)applyLayout()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  [250,700,1500,3000,6000].forEach(ms=>setTimeout(applyLayout,ms));
})();
