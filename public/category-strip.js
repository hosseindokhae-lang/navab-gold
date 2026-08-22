(() => {
  const ID = 'navab-category-strip';
  const categories = [
    ['انگشتر', ['ring','انگشتر']],
    ['دستبند', ['bracelet','دستبند']],
    ['گردنبند', ['necklace','گردنبند']],
    ['گوشواره', ['earring','گوشواره']],
    ['آویز و پلاک', ['pendant','آویز','پلاک']],
    ['زنجیر', ['chain','زنجیر']]
  ];
  const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));

  function productMatches(p, keys) {
    const hay = `${p?.shape || ''} ${p?.category || ''} ${p?.name || ''}`.toLowerCase();
    return keys.some(k => hay.includes(String(k).toLowerCase()));
  }

  async function loadProducts() {
    try {
      const r = await fetch('/api/storage/products?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return [];
      const d = await r.json();
      const raw = d?.value;
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {}
    return [];
  }

  function fallbackImage(name, index) {
    const imgs = [...document.querySelectorAll('img')].filter(img => {
      const src = img.currentSrc || img.src || '';
      return src && !src.startsWith('data:') && !/logo|icon|avatar|favicon/i.test(src);
    });
    const wanted = name.replace(/\s+/g, '');
    const exact = imgs.find(img => `${img.alt || ''}${img.title || ''}`.replace(/\s+/g, '').includes(wanted));
    return exact?.currentSrc || exact?.src || imgs[index]?.currentSrc || imgs[index]?.src || '';
  }

  function start(products) {
    if (document.getElementById(ID)) return;
    const root = document.createElement('section');
    root.id = ID;
    root.dir = 'rtl';
    root.innerHTML = `
      <div class="ncat-head"><b>دسته‌بندی محصولات</b><a href="#products">مشاهده همه</a></div>
      <div class="ncat-track">${categories.map(([name, keys], i) => {
        const p = products.find(x => productMatches(x, keys));
        const src = p?.photo || fallbackImage(name, i);
        return `<a class="ncat-card" href="#products" data-category="${esc(name)}">
          <div class="ncat-img">${src ? `<img src="${esc(src)}" alt="${esc(name)}" loading="lazy">` : `<span>${esc(name)}</span>`}</div>
          <span>${esc(name)}</span>
        </a>`;
      }).join('')}</div>`;

    const ranges = document.getElementById('navab-bracelet-ranges');
    if (ranges?.parentNode) ranges.parentNode.insertBefore(root, ranges.nextSibling);
    else document.body.prepend(root);

    const style = document.createElement('style');
    style.id = 'ncat-style';
    style.textContent = `
      #${ID}{max-width:1180px;margin:0 auto 18px;padding:0 14px;font-family:inherit}
      .ncat-head{display:flex;align-items:center;justify-content:space-between;padding:7px 4px 9px;color:#514538}
      .ncat-head b{font-size:14px}.ncat-head a{font-size:9px;color:#8f8477;text-decoration:none}
      .ncat-track{display:flex;gap:9px;overflow-x:auto;scrollbar-width:none;padding:0 1px}
      .ncat-track::-webkit-scrollbar{display:none}
      .ncat-card{flex:0 0 112px;text-decoration:none;color:#30271f;text-align:center}
      .ncat-img{height:92px;border-radius:14px;overflow:hidden;background:#eee8e0;border:1px solid rgba(88,73,54,.10);box-shadow:0 4px 14px rgba(70,55,40,.04);display:grid;place-items:center}
      .ncat-img img{width:100%;height:100%;object-fit:cover;display:block}
      .ncat-img span{font-size:12px;color:#8a7e70}.ncat-card>span{display:block;margin-top:6px;font-size:10px;font-weight:700}
      .ncat-card:active{transform:scale(.98)}
      @media(max-width:600px){#${ID}{padding:0 10px;margin-bottom:14px}.ncat-card{flex-basis:94px}.ncat-img{height:78px}.ncat-card>span{font-size:9px}}
    `;
    document.head.appendChild(style);
  }

  async function boot() {
    const products = await loadProducts();
    start(products);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
