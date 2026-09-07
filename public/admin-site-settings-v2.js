(()=>{
'use strict';
const $=id=>document.getElementById(id);
const token=()=>localStorage.getItem('navab_admin_token')||'';
const api=async(url,opt={})=>{opt.headers=Object.assign({'Content-Type':'application/json','Authorization':'Bearer '+token()},opt.headers||{});const r=await fetch(url,opt);const j=await r.json().catch(()=>({}));if(!r.ok||j.ok===false)throw Error(j.error||'خطا در ذخیره اطلاعات');return j};
const ranges=[['r10_20','۱۰ تا ۲۰ میلیون'],['r20_30','۲۰ تا ۳۰ میلیون'],['r30_40','۳۰ تا ۴۰ میلیون'],['r40_50','۴۰ تا ۵۰ میلیون'],['r50_plus','۵۰ میلیون به بالا']];
const cats=[['ring','انگشتر'],['bracelet','دستبند'],['necklace','گردنبند'],['earring','گوشواره'],['pendant','آویز و پلاک'],['chain','زنجیر']];
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
const imageKey=k=>'navab_image_'+k;
let images={},settings={};
async function read(key){const j=await api('/api/storage/'+encodeURIComponent(key)+'?t='+Date.now(),{headers:{'Cache-Control':'no-cache'}});let v=j.value;if(typeof v==='string'){try{v=JSON.parse(v)}catch{}}return v??null}
async function write(key,value){return api('/api/storage/'+encodeURIComponent(key),{method:'PUT',body:JSON.stringify({value:typeof value==='string'?value:JSON.stringify(value)})})}
function compress(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const max=850,s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));c.getContext('2d').drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.62))};im.src=r.result};r.readAsDataURL(file)})}
function notice(t,bad=false){const n=$('siteSettingsNoticeV2');if(!n)return;n.textContent=t;n.className='catalog-notice '+(bad?'bad':'ok');n.classList.remove('hidden');clearTimeout(n._t);n._t=setTimeout(()=>n.classList.add('hidden'),3500)}
async function load(){
  try{const old=await read('priceRanges');if(old&&typeof old==='object'&&!Array.isArray(old))for(const [k,v] of Object.entries(old))if(v)images[k]=v}catch{}
  await Promise.all([...ranges.map(async([k])=>{const v=await read(imageKey(k)).catch(()=>null);if(v)images[k]=v}),...cats.map(async([k])=>{const v=await read(imageKey('cat_'+k)).catch(()=>null);if(v)images['cat_'+k]=v})]);
  try{const s=await read('settings');settings=s&&typeof s==='object'?s:{}}catch{settings={}}
}
function card(key,label,kind){return `<div class="ss2-card"><div class="ss2-label">${label}</div><div class="ss2-preview">${images[key]?`<img src="${esc(images[key])}">`:'بدون عکس'}</div><label class="ss2-upload">انتخاب / تغییر عکس<input type="file" accept="image/*" data-key="${key}"></label></div>`}
function render(){
 const old=$('siteSettingsManager');if(old)old.remove();
 const oldRange=$('priceRangeManager');if(oldRange)oldRange.remove();
 const oldBrand=$('brandCopyManager');if(oldBrand)oldBrand.remove();
 if(!$('catalogManager')||$('siteSettingsManagerV2'))return;
 const p=document.createElement('div');p.id='siteSettingsManagerV2';p.className='panel';p.innerHTML=`<div class="ss2-head"><div><strong>مدیریت عکس‌ها و متن سایت</strong><small>هر عکس جداگانه روی سرور ذخیره می‌شود؛ بنابراین محدودیت مجموع عکس‌ها مانع ذخیره نمی‌شود.</small></div></div><div id="siteSettingsNoticeV2" class="catalog-notice hidden"></div><div class="ss2-section"><b>عکس بازه‌های قیمتی</b><div class="ss2-grid">${ranges.map(([k,l])=>card(k,l,'range')).join('')}</div></div><div class="ss2-section"><b>عکس دسته‌بندی‌ها</b><div class="ss2-grid">${cats.map(([k,l])=>card('cat_'+k,l,'cat')).join('')}</div></div><div class="ss2-section"><b>متن‌های اصلی سایت</b><div class="ss2-text"><label>عنوان اصلی<input id="ss2Title" value="${esc(settings.siteTitle||'')}"></label><label>شعار / توضیح کوتاه<input id="ss2Tagline" value="${esc(settings.siteTagline||'')}"></label></div><button id="ss2TextSave" class="btn">ذخیره متن سایت</button></div>`;
 $('catalogManager').after(p);
 const st=document.createElement('style');st.id='ss2Style';st.textContent='#siteSettingsManagerV2{margin-top:15px}.ss2-head strong{display:block;color:#fff}.ss2-head small{display:block;color:var(--muted);font-size:11px;margin-top:4px}.ss2-section{border-top:1px solid var(--line);padding:14px 0}.ss2-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}.ss2-card{background:#101b30;border:1px solid var(--line);border-radius:12px;padding:10px}.ss2-label{font-size:12px;color:#fff;margin-bottom:7px}.ss2-preview{height:105px;border-radius:9px;overflow:hidden;background:#0b1220;display:grid;place-items:center;color:var(--muted);font-size:10px}.ss2-preview img{width:100%;height:100%;object-fit:cover}.ss2-upload{display:block;text-align:center;margin-top:8px;border:1px solid var(--line);border-radius:8px;padding:8px;color:#fff;font-size:11px;cursor:pointer}.ss2-upload input{display:none}.ss2-text{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.ss2-text label{color:var(--muted);font-size:11px}.ss2-text input{display:block;width:100%;margin-top:5px;padding:10px;background:#101b30;color:#fff;border:1px solid var(--line);border-radius:8px}@media(max-width:700px){.ss2-grid{grid-template-columns:1fr 1fr}}@media(max-width:450px){.ss2-grid,.ss2-text{grid-template-columns:1fr}}';document.head.appendChild(st);
 p.querySelectorAll('[data-key]').forEach(inp=>inp.onchange=async()=>{const file=inp.files?.[0],key=inp.dataset.key;if(!file)return;try{const data=await compress(file);await write(imageKey(key),data);const verify=await read(imageKey(key));if(verify!==data)throw Error('ذخیره عکس تأیید نشد');images[key]=verify;render();notice('عکس واقعاً ذخیره شد ✓')}catch(e){notice(e.message||'ذخیره عکس انجام نشد',true)}});
 $('ss2TextSave').onclick=async()=>{try{const cur=await read('settings');const merged={...(cur&&typeof cur==='object'?cur:{}),siteTitle:$('ss2Title').value.trim(),siteTagline:$('ss2Tagline').value.trim()};await write('settings',merged);settings=merged;notice('متن واقعاً ذخیره شد ✓')}catch(e){notice(e.message||'ذخیره انجام نشد',true)}};
}
async function boot(){try{await load();render()}catch(e){console.error(e)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,850));else setTimeout(boot,850);
})();