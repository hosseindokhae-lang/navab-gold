(() => {
  const id = 'navab-live-prices-full';
  const nf = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 });
  const labels = {
    usd: ['دلار آمریکا', 'تومان'], eur: ['یورو', 'تومان'], gbp: ['پوند انگلیس', 'تومان'],
    aed: ['درهم امارات', 'تومان'], cad: ['دلار کانادا', 'تومان'], chf: ['فرانک سوئیس', 'تومان'],
    cny: ['یوان چین', 'تومان'], pkr: ['روپیه پاکستان', 'تومان'], omr: ['ریال عمان', 'تومان'],
    try: ['لیر ترکیه', 'تومان'], thb: ['بات تایلند', 'تومان'],
    gram18: ['طلای ۱۸ عیار', 'تومان/گرم'], gram740: ['طلای ۷۴۰', 'تومان/گرم'],
    gram21: ['طلای ۲۱ عیار', 'تومان/گرم'], gram22: ['طلای ۲۲ عیار', 'تومان/گرم'],
    gram995: ['طلای ۹۹۵', 'تومان/گرم'], gram999: ['طلای ۹۹۹', 'تومان/گرم'],
    ounceUsd: ['اونس جهانی طلا', 'دلار'], mazanehJahani: ['مظنه جهانی', 'تومان'],
    mazanehDubai: ['مظنه دبی', 'تومان'], bazartehran: ['بازار تهران', 'تومان'],
    emami: ['سکه امامی', 'تومان'], oldCoin: ['سکه بهار آزادی', 'تومان'], half: ['نیم سکه', 'تومان'],
    quarter: ['ربع سکه', 'تومان'], gerami: ['سکه گرمی', 'تومان'], coinValue: ['ارزش ذاتی سکه', 'تومان'],
    coinBubble: ['حباب سکه', 'تومان'], usdtIrt: ['تتر', 'تومان']
  };
  const groups = [
    ['ارزهای زنده', ['usd','eur','gbp','aed','cad','chf','cny','pkr','omr','try','thb','usdtIrt']],
    ['طلا و بازار', ['gram18','gram740','gram21','gram22','gram995','gram999','ounceUsd','mazanehJahani','mazanehDubai','bazartehran']],
    ['سکه', ['emami','oldCoin','half','quarter','gerami','coinValue','coinBubble']]
  ];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = v => v == null ? '—' : nf.format(Number(v));

  function ensure() {
    if (document.getElementById(id)) return document.getElementById(id);
    const el = document.createElement('section');
    el.id = id;
    el.dir = 'rtl';
    el.innerHTML = `<div class="nlgp-head"><div><span class="nlgp-dot"></span><strong>قیمت‌های زنده بازار</strong><small id="nlgp-time">در حال دریافت…</small></div><span class="nlgp-source">منبع: طلا</span></div><div class="nlgp-groups"></div>`;
    const candidates = [...document.querySelectorAll('main, body > div, body > section')];
    const target = candidates.find(x => /محصول|قیمت|دسته/.test(x.innerText || '')) || document.body;
    target.appendChild(el);
    return el;
  }

  function render(market, updatedAt) {
    const root = ensure();
    const groupsEl = root.querySelector('.nlgp-groups');
    groupsEl.innerHTML = groups.map(([title, keys]) => {
      const items = keys.filter(k => market[k] != null).map(k => {
        const [name, unit] = labels[k];
        return `<article class="nlgp-card"><span class="nlgp-name">${esc(name)}</span><strong>${money(market[k])}</strong><small>${esc(unit)}</small></article>`;
      }).join('');
      return items ? `<div class="nlgp-group"><h3>${esc(title)}</h3><div class="nlgp-row">${items}</div></div>` : '';
    }).join('');
    root.querySelector('#nlgp-time').textContent = updatedAt ? `آخرین بروزرسانی: ${new Date(updatedAt).toLocaleTimeString('fa-IR')}` : 'قیمت زنده';
  }

  function fail() {
    const root = ensure();
    root.querySelector('#nlgp-time').textContent = 'اتصال قیمت زنده در حال برقراری است…';
  }

  function injectStyle() {
    if (document.getElementById('nlgp-style')) return;
    const s = document.createElement('style'); s.id = 'nlgp-style';
    s.textContent = `#navab-live-prices-full{margin:18px auto 28px;max-width:1180px;padding:0 14px;font-family:inherit}.nlgp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:1px solid rgba(90,75,55,.16);border-radius:18px;background:rgba(255,255,255,.72);box-shadow:0 8px 28px rgba(80,60,40,.06)}.nlgp-head>div{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.nlgp-head strong{font-size:16px;color:#4d3b29}.nlgp-head small{font-size:11px;color:#8b8177}.nlgp-source{font-size:11px;color:#74644f}.nlgp-dot{width:8px;height:8px;border-radius:50%;background:#71934f;display:inline-block;box-shadow:0 0 0 4px rgba(113,147,79,.12)}.nlgp-group{margin-top:12px}.nlgp-group h3{margin:0 4px 8px;font-size:14px;color:#554633}.nlgp-row{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 8px;scrollbar-width:none}.nlgp-row::-webkit-scrollbar{display:none}.nlgp-card{flex:0 0 132px;min-height:78px;padding:12px;border-radius:16px;background:linear-gradient(145deg,#fffdf9,#eee8df);border:1px solid rgba(90,75,55,.12);display:flex;flex-direction:column;justify-content:center;gap:3px}.nlgp-name{font-size:11px;color:#6b5e50}.nlgp-card strong{font-size:15px;color:#352a20;direction:ltr;text-align:right}.nlgp-card small{font-size:9px;color:#9a8f82}@media(min-width:700px){#navab-live-prices-full{padding:0 24px}.nlgp-card{flex-basis:150px}}`;
    document.head.appendChild(s);
  }

  async function load() {
    try {
      const r = await fetch('/api/market?full=1&t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('market unavailable');
      const data = await r.json();
      if (!data.live) throw new Error('not live');
      render(data.market || {}, data.updatedAt);
    } catch { fail(); }
  }

  function start() { injectStyle(); load(); setInterval(load, 30000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
