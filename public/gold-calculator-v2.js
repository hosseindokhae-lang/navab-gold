(()=>{
  const ID='navab-modern-calculator';
  const OLD=['goldCalculator','navab-price-calculator'];
  const money=n=>new Intl.NumberFormat('fa-IR').format(Math.round(Number(n)||0));
  const num=v=>{const s=String(v??'').replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[٬،,]/g,'').trim();const n=Number(s);return Number.isFinite(n)?n:0};
  const removeOld=()=>{OLD.forEach(id=>document.getElementById(id)?.remove());document.querySelectorAll('[data-old-gold-calculator="true"]').forEach(e=>e.remove())};
  const findProducts=()=>document.getElementById('products')||document.querySelector('[id*="products" i]');
  function make(){
    if(document.getElementById(ID))return document.getElementById(ID);
    const el=document.createElement('section');
    el.id=ID;
    el.setAttribute('data-new-calculator','true');
    el.innerHTML=`
      <div class="ncalc-card">
        <div class="ncalc-head">
          <div><div class="ncalc-kicker">محاسبه‌گر نواب گلد</div><h2>محاسبه قیمت نهایی طلا</h2><p>وزن و اجرت را وارد کنید؛ قیمت نهایی بر اساس نرخ زنده طلای ۱۸ عیار محاسبه می‌شود.</p></div>
          <div class="ncalc-live"><span></span> نرخ زنده</div>
        </div>
        <div class="ncalc-grid">
          <label><span>وزن طلا <small>(گرم)</small></span><input id="ncalc-weight" inputmode="decimal" type="number" min="0" step="0.01" placeholder="مثلاً 3.50"></label>
          <label><span>اجرت <small>(درصد)</small></span><input id="ncalc-wage" inputmode="decimal" type="number" min="0" step="0.1" value="14" placeholder="مثلاً 14"></label>
        </div>
        <div class="ncalc-meta"><span>نرخ طلای ۱۸ عیار</span><strong id="ncalc-rate">در حال دریافت...</strong></div>
        <div class="ncalc-result-grid">
          <div><span>قیمت پایه</span><b id="ncalc-base">—</b></div>
          <div><span>مبلغ اجرت</span><b id="ncalc-wage-amount">—</b></div>
          <div><span>سود ک طلافروش</span><b id="ncalc-profit">—</b></div>
        </div>
        <div class="ncalc-final"><span>قیمت نهایی</span><strong id="ncalc-final">—</strong><small>تومان</small></div>
        <div class="ncalc-status" id="ncalc-status">در حال دریافت نرخ بازار...</div>
      </div>`;
    const style=document.createElement('style');style.id='ncalc-style';style.textContent=`
      #${ID}{width:min(820px,calc(100% - 28px));margin:18px auto 30px;position:relative;z-index:8;box-sizing:border-box;font-family:Vazirmatn,Arial,sans-serif}
      #${ID} *{box-sizing:border-box}
      #${ID} .ncalc-card{background:linear-gradient(135deg,#123b35 0%,#1d5a4d 55%,#23473f 100%);border:1px solid rgba(226,184,92,.55);border-radius:20px;padding:20px;box-shadow:0 16px 36px rgba(0,0,0,.22);color:#fff}
      #${ID} .ncalc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}
      #${ID} .ncalc-kicker{font-size:11px;color:#e7c46d;margin-bottom:3px;font-weight:700}
      #${ID} h2{margin:0;font-size:19px;color:#fff}
      #${ID} p{margin:6px 0 0;color:rgba(255,255,255,.72);font-size:11px;line-height:1.8}
      #${ID} .ncalc-live{white-space:nowrap;border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.12);padding:7px 10px;border-radius:999px;font-size:10px;color:#e9e2ce}
      #${ID} .ncalc-live span{display:inline-block;width:7px;height:7px;border-radius:50%;background:#69d391;margin-left:5px}
      #${ID} .ncalc-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      #${ID} label{display:block}
      #${ID} label>span{display:block;font-size:11px;color:rgba(255,255,255,.82);margin:0 0 6px}
      #${ID} label small{opacity:.65}
      #${ID} input{width:100%;height:43px;border:1px solid rgba(255,255,255,.15);border-radius:11px;background:rgba(255,255,255,.96);color:#17332e;padding:8px 11px;font:500 13px Vazirmatn,Arial,sans-serif;outline:none}
      #${ID} input:focus{border-color:#e7c46d;box-shadow:0 0 0 3px rgba(231,196,109,.15)}
      #${ID} .ncalc-meta{display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12);padding:11px 2px;margin:15px 0 10px;font-size:11px;color:rgba(255,255,255,.7)}
      #${ID} .ncalc-meta strong{font-size:13px;color:#f4d88c}
      #${ID} .ncalc-result-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
      #${ID} .ncalc-result-grid>div{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px}
      #${ID} .ncalc-result-grid span{display:block;color:rgba(255,255,255,.62);font-size:9px;margin-bottom:5px}
      #${ID} .ncalc-result-grid b{font-size:12px;color:#fff}
      #${ID} .ncalc-final{margin-top:10px;background:linear-gradient(90deg,rgba(231,196,109,.16),rgba(255,255,255,.08));border:1px solid rgba(231,196,109,.32);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:8px}
      #${ID} .ncalc-final span{font-size:11px;color:rgba(255,255,255,.72);margin-left:auto}
      #${ID} .ncalc-final strong{font-size:20px;color:#f4d88c}
      #${ID} .ncalc-final small{font-size:9px;color:rgba(255,255,255,.55)}
      #${ID} .ncalc-status{text-align:center;margin-top:8px;font-size:9px;color:rgba(255,255,255,.5);min-height:14px}
      @media(max-width:600px){#${ID}{width:calc(100% - 16px);margin:12px auto 22px}#${ID} .ncalc-card{padding:14px;border-radius:16px}#${ID} .ncalc-head{display:block}#${ID} .ncalc-live{display:inline-block;margin-top:8px}#${ID} h2{font-size:16px}#${ID} .ncalc-grid{gap:8px}#${ID} .ncalc-result-grid{grid-template-columns:1fr 1fr}#${ID} .ncalc-result-grid>div:last-child{grid-column:1/-1}#${ID} .ncalc-final strong{font-size:17px}}
    `;document.head.appendChild(style);return el;
  }
  function place(el){const products=findProducts();if(!products||!products.parentElement)return false;const host=products.parentElement;if(el.parentElement!==host)host.insertBefore(el,products);else host.insertBefore(el,products);return true}
  async function rate(){const rateEl=document.getElementById('ncalc-rate'),status=document.getElementById('ncalc-status');try{const r=await fetch('/api/market?calculator=1&_='+Date.now(),{cache:'no-store'});const j=await r.json();const n=Number(j?.market?.gram18);if(n>0){window.__navab18=n;rateEl.textContent=money(n)+' تومان';status.textContent='نرخ زنده طلای ۱۸ عیار دریافت شد.';calc();return}throw new Error('no gram18')}catch{rateEl.textContent='در دسترس نیست';status.textContent='اتصال به نرخ زنده برقرار نشد؛ بعداً دوباره تلاش می‌شود.'}}
  function calc(){const rate=Number(window.__navab18)||0,w=num(document.getElementById('ncalc-weight')?.value),wp=num(document.getElementById('ncalc-wage')?.value);const base=w*rate,wage=base*wp/100,profit=(base+wage)*0.07,final=base+wage+profit;document.getElementById('ncalc-base').textContent=base?money(base):'—';document.getElementById('ncalc-wage-amount').textContent=wage?money(wage):'—';document.getElementById('ncalc-profit').textContent=profit?money(profit):'—';document.getElementById('ncalc-final').textContent=final?money(final):'—'}
  function boot(){removeOld();const el=make();place(el);document.getElementById('ncalc-weight')?.addEventListener('input',calc);document.getElementById('ncalc-wage')?.addEventListener('input',calc);rate()}
  let tries=0;const obs=new MutationObserver(()=>{removeOld();const el=document.getElementById(ID)||make();if(place(el))tries++;if(tries>120)obs.disconnect()});obs.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  [800,1800,3500,6000].forEach(ms=>setTimeout(()=>{removeOld();const el=document.getElementById(ID)||make();place(el)},ms));
})();