(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const $=id=>document.getElementById(id);
  let cats=[];
  let busy=false;

  async function api(url,opt={}){
    opt.headers=Object.assign({
      'Content-Type':'application/json',
      'Authorization':'Bearer '+(localStorage.getItem('navab_admin_token')||'')
    },opt.headers||{});
    const r=await fetch(url,opt);
    const j=await r.json().catch(()=>({}));
    if(r.status===401) throw Error('جلسه مدیریت منقضی شده؛ دوباره وارد شو.');
    if(!r.ok||j.ok===false) throw Error(j.error||'خطا در ذخیره اطلاعات');
    return j;
  }

  async function load(){
    try{
      const j=await api('/api/storage/catalog?t='+Date.now(),{headers:{'Cache-Control':'no-cache'}});
      cats=Array.isArray(j.value)?j.value:(typeof j.value==='string'&&j.value?JSON.parse(j.value):[]);
      if(!Array.isArray(cats))cats=[];
    }catch(e){
      cats=[];
      notice(e.message,false);
    }
    render();
  }

  async function save(){
    return api('/api/storage/catalog',{method:'PUT',body:JSON.stringify({value:JSON.stringify(cats)})});
  }

  function notice(text,ok=true){
    const e=$('catalogNotice');
    if(!e)return;
    e.textContent=text;
    e.className='catalog-notice '+(ok?'ok':'bad');
    e.classList.remove('hidden');
    clearTimeout(e._t);
    e._t=setTimeout(()=>e.classList.add('hidden'),3200);
  }

  function imagePreview(src){
    return src?`<img src="${esc(src)}" alt="" loading="lazy">`:'<span class="catalog-no-image">بدون عکس</span>';
  }

  function render(){
    const root=$('catalogManager');
    if(!root)return;
    const list=root.querySelector('.catalog-list');
    if(!list)return;

    list.innerHTML=cats.length?cats.map((c,i)=>`
      <div class="catalog-row" data-index="${i}">
        <div class="catalog-image">${imagePreview(c.image||'')}</div>
        <div class="catalog-main">
          <div class="catalog-name-line">
            <input class="catalog-name" value="${esc(c.name||'')}" data-i="${i}" aria-label="نام دسته">
            <span class="catalog-index">${i+1}</span>
          </div>
          <div class="catalog-kind">
            <label><input type="checkbox" ${c.featured?'checked':''} data-i="${i}" data-f="featured"> منتخب</label>
            <label><input type="checkbox" ${c.discounted?'checked':''} data-i="${i}" data-f="discounted"> تخفیف ویژه</label>
            <label><input type="checkbox" ${c.newProduct?'checked':''} data-i="${i}" data-f="newProduct"> جدید</label>
          </div>
          <div class="catalog-actions">
            <label class="catalog-upload">تغییر عکس<input type="file" accept="image/*" data-i="${i}" class="catalog-file"></label>
            <button class="catalog-btn" type="button" data-save="${i}">ذخیره تغییرات</button>
            <button class="catalog-btn danger" type="button" data-del="${i}">حذف</button>
          </div>
        </div>
      </div>`).join(''):
      '<div class="catalog-empty">هنوز دسته‌ای ساخته نشده. روی «+ دسته جدید» بزن.</div>';

    root.querySelectorAll('.catalog-name').forEach(e=>e.addEventListener('input',()=>{
      cats[Number(e.dataset.i)].name=e.value;
    }));

    root.querySelectorAll('[data-f]').forEach(e=>e.addEventListener('change',()=>{
      cats[Number(e.dataset.i)][e.dataset.f]=e.checked;
    }));

    root.querySelectorAll('.catalog-file').forEach(e=>e.addEventListener('change',async()=>{
      const file=e.files?.[0];
      const i=Number(e.dataset.i);
      if(!file)return;
      try{
        e.disabled=true;
        cats[i].image=await resize(file);
        render();
        await save();
        notice('عکس دسته ذخیره شد');
      }catch(err){
        notice('ذخیره عکس انجام نشد: '+err.message,false);
      }finally{e.disabled=false;}
    }));

    root.querySelectorAll('[data-save]').forEach(e=>e.addEventListener('click',async()=>{
      const i=Number(e.dataset.save);
      const name=String(cats[i]?.name||'').trim();
      if(!name){notice('اول نام دسته را وارد کن.',false);root.querySelector(`.catalog-name[data-i="${i}"]`)?.focus();return;}
      if(busy)return;
      try{
        busy=true;e.disabled=true;
        cats[i].name=name;
        await save();
        notice('تغییرات دسته ذخیره شد');
      }catch(err){notice('ذخیره انجام نشد: '+err.message,false)}
      finally{busy=false;e.disabled=false;}
    }));

    root.querySelectorAll('[data-del]').forEach(e=>e.addEventListener('click',async()=>{
      const i=Number(e.dataset.del);
      const item=cats[i];
      if(!item)return;
      if(!confirm(`دسته «${item.name||'بدون نام'}» حذف شود؟`))return;
      if(busy)return;
      const old=cats.slice();
      cats.splice(i,1);render();
      try{busy=true;await save();notice('دسته حذف شد')}catch(err){cats=old;render();notice('حذف انجام نشد: '+err.message,false)}finally{busy=false}
    }));
  }

  function resize(file){
    return new Promise((resolve,reject)=>{
      const rd=new FileReader();
      rd.onerror=reject;
      rd.onload=()=>{
        const img=new Image();
        img.onerror=reject;
        img.onload=()=>{
          const max=1000;
          const scale=Math.min(1,max/Math.max(img.width,img.height));
          const c=document.createElement('canvas');
          c.width=Math.max(1,Math.round(img.width*scale));
          c.height=Math.max(1,Math.round(img.height*scale));
          const ctx=c.getContext('2d');
          ctx.drawImage(img,0,0,c.width,c.height);
          resolve(c.toDataURL('image/jpeg',.82));
        };
        img.src=rd.result;
      };
      rd.readAsDataURL(file);
    });
  }

  function toggle(){
    const body=$('catalogBody');
    const btn=$('catalogToggle');
    if(!body||!btn)return;
    const closed=body.classList.toggle('hidden');
    btn.textContent=closed?'باز کردن':'بستن';
    btn.setAttribute('aria-expanded',String(!closed));
  }

  function openCreateForm(){
    const body=$('catalogBody');
    if(body?.classList.contains('hidden'))toggle();
    const form=$('catalogCreate');
    if(!form)return;
    form.classList.remove('hidden');
    $('newCatalogName').value='';
    $('newCatalogFile').value='';
    $('newCatalogPreview').classList.add('hidden');
    $('newCatalogPreview').removeAttribute('src');
    $('newFeatured').checked=false;
    $('newDiscounted').checked=false;
    $('newProduct').checked=false;
    setTimeout(()=>$('newCatalogName')?.focus(),30);
  }

  function closeCreateForm(){
    $('catalogCreate')?.classList.add('hidden');
  }

  function bindCreateForm(){
    $('addCatalog')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openCreateForm()});
    $('catalogCancelCreate')?.addEventListener('click',e=>{e.preventDefault();closeCreateForm()});
    $('newCatalogFile')?.addEventListener('change',e=>{
      const file=e.target.files?.[0];
      if(!file){$('newCatalogPreview').classList.add('hidden');return;}
      const rd=new FileReader();
      rd.onload=()=>{$('newCatalogPreview').src=rd.result;$('newCatalogPreview').classList.remove('hidden')};
      rd.readAsDataURL(file);
    });
    $('catalogCreateForm')?.addEventListener('submit',async e=>{
      e.preventDefault();e.stopPropagation();
      if(busy)return;
      const name=$('newCatalogName').value.trim();
      if(!name){notice('نام دسته را وارد کن.',false);$('newCatalogName').focus();return;}
      const file=$('newCatalogFile').files?.[0];
      const newCat={id:'cat_'+Date.now().toString(36),name,image:'',featured:$('newFeatured').checked,discounted:$('newDiscounted').checked,newProduct:$('newProduct').checked};
      const old=cats.slice();
      try{
        busy=true;
        $('catalogCreateSave').disabled=true;
        $('catalogCreateSave').textContent='در حال ذخیره...';
        if(file){
          $('catalogCreateStatus').textContent='در حال آماده‌سازی عکس...';
          newCat.image=await resize(file);
        }
        cats.push(newCat);
        await save();
        render();
        closeCreateForm();
        notice('دسته جدید با موفقیت اضافه شد');
      }catch(err){
        cats=old;render();notice('افزودن دسته انجام نشد: '+err.message,false);
      }finally{
        busy=false;
        $('catalogCreateSave').disabled=false;
        $('catalogCreateSave').textContent='ذخیره دسته';
        if($('catalogCreateStatus'))$('catalogCreateStatus').textContent='';
      }
    });
  }

  function inject(){
    if($('catalogManager'))return;
    const host=document.querySelector('#productList')?.closest('.panel');
    if(!host)return;
    const panel=document.createElement('div');
    panel.className='panel';
    panel.id='catalogManager';
    panel.innerHTML=`
      <div class="section-title catalog-header">
        <button type="button" class="catalog-title-button" id="catalogToggleArea">
          <span><strong>مدیریت دسته‌بندی و ویترین</strong><small>نام، عکس و وضعیت هر دسته را از همین‌جا مدیریت کن.</small></span>
          <span class="catalog-toggle" id="catalogToggle" aria-expanded="true">بستن</span>
        </button>
        <button class="btn" type="button" id="addCatalog">+ دسته جدید</button>
      </div>
      <div id="catalogBody">
        <div id="catalogNotice" class="catalog-notice hidden"></div>
        <div id="catalogCreate" class="catalog-create hidden">
          <form id="catalogCreateForm">
            <div class="catalog-create-title">ساخت دسته جدید</div>
            <div class="catalog-create-grid">
              <div class="field"><label>نام دسته *</label><input id="newCatalogName" autocomplete="off" placeholder="مثلاً دستبند"></div>
              <div class="field"><label>عکس دسته</label><input id="newCatalogFile" type="file" accept="image/*"><div class="catalog-create-help">همان عکس کارت دسته‌بندی در سایت خواهد شد.</div><img id="newCatalogPreview" class="catalog-new-preview hidden" alt="پیش‌نمایش عکس دسته"></div>
            </div>
            <div class="catalog-kind create-kind">
              <label><input id="newFeatured" type="checkbox"> منتخب</label>
              <label><input id="newDiscounted" type="checkbox"> تخفیف ویژه</label>
              <label><input id="newProduct" type="checkbox"> جدید</label>
            </div>
            <div id="catalogCreateStatus" class="catalog-create-help"></div>
            <div class="catalog-actions"><button id="catalogCreateSave" class="btn" type="submit">ذخیره دسته</button><button id="catalogCancelCreate" class="catalog-btn" type="button">انصراف</button></div>
          </form>
        </div>
        <div class="catalog-list"></div>
      </div>`;
    host.parentNode.insertBefore(panel,host.nextSibling);

    const st=document.createElement('style');
    st.id='navab-catalog-style';
    st.textContent=`
      #catalogManager{margin-top:15px}.catalog-header{align-items:center}.catalog-title-button{flex:1;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:right;background:transparent;border:0;color:#fff;padding:0;min-width:0}.catalog-title-button span:first-child{display:flex;flex-direction:column;gap:4px}.catalog-title-button strong{font-size:1rem}.catalog-title-button small{color:var(--muted);font-size:.76rem;font-weight:400}.catalog-toggle{display:inline-flex;align-items:center;justify-content:center;min-width:58px;padding:8px 12px;border-radius:10px;background:rgba(215,164,93,.12);border:1px solid var(--line);color:var(--gold2);font-weight:900;font-size:.78rem}.catalog-notice{margin:10px 0;padding:10px 12px;border-radius:10px;background:#0b1525;border:1px solid var(--line);font-size:.82rem}.catalog-notice.ok{color:var(--ok)}.catalog-notice.bad{color:var(--danger)}.catalog-create{margin:12px 0;padding:14px;border:1px solid rgba(215,164,93,.28);border-radius:14px;background:#0b1525}.catalog-create-title{font-weight:900;margin-bottom:8px;color:var(--gold2)}.catalog-create-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.catalog-create-help{font-size:.75rem;color:var(--muted);line-height:1.7;margin-top:5px}.catalog-new-preview{width:110px;height:110px;object-fit:cover;border-radius:12px;border:1px solid var(--line);margin-top:8px}.catalog-kind{display:flex;gap:12px;flex-wrap:wrap;margin:9px 0;color:#fff;font-size:12px}.catalog-row{display:grid;grid-template-columns:92px 1fr;gap:13px;padding:13px 0;border-top:1px solid var(--line)}.catalog-image{width:92px;height:92px;border-radius:14px;background:#0b1525;border:1px solid var(--line);display:grid;place-items:center;overflow:hidden;color:var(--muted);font-size:11px}.catalog-image img{width:100%;height:100%;object-fit:cover}.catalog-main{min-width:0}.catalog-name-line{display:flex;align-items:center;gap:8px}.catalog-index{min-width:26px;height:26px;border-radius:8px;background:rgba(215,164,93,.1);color:var(--gold2);display:grid;place-items:center;font-size:11px}.catalog-name{width:100%;background:#0a1424;color:#fff;border:1px solid var(--line);border-radius:10px;padding:10px}.catalog-actions{display:flex;gap:7px;flex-wrap:wrap}.catalog-upload,.catalog-btn{border:1px solid var(--line);background:transparent;color:#fff;border-radius:9px;padding:8px 11px;font-size:11px;cursor:pointer}.catalog-upload input{display:none}.catalog-btn{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#21170d;font-weight:900}.catalog-btn.danger{background:transparent;color:var(--danger)}.catalog-empty{padding:20px;text-align:center;color:var(--muted);border-top:1px solid var(--line)}
      @media(max-width:560px){.catalog-row{grid-template-columns:75px 1fr}.catalog-image{width:75px;height:75px}.catalog-title-button small{display:none}.catalog-header{align-items:stretch;flex-direction:column}.catalog-title-button{width:100%}.catalog-create-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(st);
    $('catalogToggleArea').addEventListener('click',toggle);
    bindCreateForm();
  }

  function start(){inject();load();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else setTimeout(start,250);
  const mo=new MutationObserver(()=>inject());
  mo.observe(document.body,{childList:true,subtree:true});
})();