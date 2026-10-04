(()=>{
  const IDS={market:'navab-market-strip',categories:'navab-category-strip',ranges:'navab-price-ranges',calc:'goldCalculator',products:'products'};
  const $=id=>document.getElementById(id);

  function applyLayout(){
    const market=$(IDS.market), categories=$(IDS.categories), ranges=$(IDS.ranges), calc=$(IDS.calc), products=$(IDS.products);
    if(!products) return false;

    const anchor=calc||products;
    const parent=anchor.parentElement;
    if(!parent) return false;

    // Keep the category/range blocks in the main storefront flow, immediately after the market strip.
    if(market?.parentElement===parent){
      let cursor=market.nextElementSibling;
      if(categories && categories!==cursor){ parent.insertBefore(categories,cursor||anchor); }
      cursor=categories?.nextElementSibling||market.nextElementSibling;
      if(ranges && ranges!==cursor){ parent.insertBefore(ranges,cursor||anchor); }
    }

    // The calculator belongs directly above the product photos/cards.
    if(calc && calc!==products){
      parent.insertBefore(calc,products);
      calc.classList.add('ng-calculator-top');
    }

    if(categories) categories.classList.add('ng-category-main');
    if(ranges) ranges.classList.add('ng-range-main');
    return true;
  }

  function style(){
    if(document.getElementById('ng-layout-fix-v3-style')) return;
    const s=document.createElement('style');
    s.id='ng-layout-fix-v3-style';
    s.textContent=`
      #goldCalculator.ng-calculator-top{
        width:100%;
        max-width:920px;
        margin:18px auto 26px !important;
        padding:0 12px !important;
        box-sizing:border-box;
      }
      #goldCalculator.ng-calculator-top .wrap{max-width:920px;margin:0 auto;padding:0}
      #goldCalculator.ng-calculator-top .gold-calculator{
        background:linear-gradient(135deg,#182336 0%,#24344d 100%) !important;
        color:#fff !important;
        border:1px solid rgba(210,170,85,.35) !important;
        border-radius:18px !important;
        box-shadow:0 12px 30px rgba(0,0,0,.16) !important;
        padding:16px 18px !important;
      }
      #goldCalculator.ng-calculator-top .section-head{margin-bottom:10px !important}
      #goldCalculator.ng-calculator-top .section-title{font-size:17px !important;color:#f2d28a !important}
      #goldCalculator.ng-calculator-top .section-sub{font-size:11px !important;color:rgba(255,255,255,.68) !important}
      #goldCalculator.ng-calculator-top .calculator-box{
        background:rgba(255,255,255,.06) !important;
        border:1px solid rgba(255,255,255,.10) !important;
        border-radius:14px !important;
        padding:12px 14px !important;
      }
      #goldCalculator.ng-calculator-top label{color:#f5f5f5 !important;font-size:12px !important}
      #goldCalculator.ng-calculator-top input,
      #goldCalculator.ng-calculator-top select{
        height:38px !important;
        min-height:38px !important;
        padding:7px 10px !important;
        font-size:13px !important;
        border-radius:10px !important;
        background:#fff !important;
        color:#222 !important;
      }
      #goldCalculator.ng-calculator-top .result,
      #goldCalculator.ng-calculator-top .calculator-result{
        border-radius:12px !important;
        font-size:14px !important;
      }
      #navab-category-strip.ng-category-main,#navab-price-ranges.ng-range-main{
        position:relative !important;
        z-index:2 !important;
        max-width:1180px !important;
        margin-left:auto !important;
        margin-right:auto !important;
      }
      @media(max-width:600px){
        #goldCalculator.ng-calculator-top{padding:0 8px !important;margin:14px auto 20px !important}
        #goldCalculator.ng-calculator-top .gold-calculator{padding:13px !important;border-radius:15px !important}
        #goldCalculator.ng-calculator-top .section-title{font-size:15px !important}
      }
    `;
    document.head.appendChild(s);
  }

  function boot(){
    style();
    applyLayout();
  }

  let runs=0;
  const observer=new MutationObserver(()=>{
    if(runs++>80) return;
    applyLayout();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  setTimeout(()=>{applyLayout();},300);
  setTimeout(()=>{applyLayout();},1000);
  setTimeout(()=>{applyLayout();},2500);
})();