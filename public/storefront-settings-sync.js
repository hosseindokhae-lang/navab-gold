(()=>{
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
async function get(k){try{const r=await fetch('/api/storage/'+k+'?t='+Date.now(),{cache:'no-store'});const j=await r.json();let v=j?.value;if(typeof v==='string'){try{v=JSON.parse(v)}catch{}}return v||{}}catch{return{}}}
const rangeDefs=[['۱۰ تا ۲۰ میلیون','r10_20'],['۲۰ تا ۳۰ میلیون','r20_30'],['۳۰ تا ۴۰ میلیون','r30_40'],['۴۰ تا ۵۰ میلیون','r40_50'],['۵۰ میلیون به بالا','r50_plus']];
const catDefs=[['انگشتر','cat_ring'],['دستبند','cat_bracelet'],['گردنبند','cat_necklace'],['گوشواره','cat_earring'],['آویز و پلاک','cat_pendant'],['زنجیر','cat_chain']];
function findText(t){return [...document.querySelectorAll('h1,h2,h3,h4,p,span,b,strong,div')].find(e=>e.children.length===0&&e.textContent.trim()===t)}
async function sync(){
 const ranges=await get('priceRanges'); const settings=await get('settings');
 // Update existing price-range cards without changing their layout.
 const host=document.getElementById('navab-bracelet-ranges');
 if(host){const cards=[...host.querySelectorAll('a,article,.range-card,.price-range-card,[data-range]')];rangeDefs.forEach(([label,key],i)=>{const src=ranges[key];let card=cards[i];if(!card)return;if(src){let img=card.querySelector('img');if(!img){img=document.createElement('img');img.alt=label;card.prepend(img)}img.src=src;img.style.width='100%';img.style.height='100%';img.style.objectFit='cover'}})}
 // If the existing range section is present but its cards are not image-aware, add a compact image strip inside it.
 if(host&&!host.querySelector('.navab-range-admin-images')){const wrap=document.createElement('div');wrap.className='navab-range-admin-images';wrap.innerHTML=rangeDefs.map(([label,key])=>`<a href="#products"><div>${ranges[key]?`<img src="${esc(ranges[key])}" alt="${esc(label)}">`:'<span>بدون عکس</span>'}</div><b>${esc(label)}</b></a>`).join('');host.appendChild(wrap);const st=document.createElement('style');st.textContent='.navab-range-admin-images{display:flex;gap:10px;overflow-x:auto;padding:8px 2px}.navab-range-admin-images a{flex:0 0 105px;text-decoration:none;color:inherit;text-align:center}.navab-range-admin-images a div{height:82px;border-radius:12px;overflow:hidden;background:#eee8e0;display:grid;place-items:center}.navab-range-admin-images img{width:100%;height:100%;object-fit:cover}.navab-range-admin-images span{font-size:10px}.navab-range-admin-images b{display:block;font-size:9px;margin-top:5px}';document.head.appendChild(st)}
 // Replace exact visible title/tagline text only when admin supplied a non-empty value.
 if(settings.siteTitle){const old=findText('طلا و جواهرات با اصالت');if(old)old.textContent=settings.siteTitle}
 if(settings.siteTagline){const candidates=['زیبایی ماندگار، اصالت واقعی','طلا و جواهرات با اصالت'];const el=candidates.map(findText).find(Boolean);if(el&&el.textContent!==settings.siteTitle)el.textContent=settings.siteTagline}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,900));else setTimeout(sync,900);
})();