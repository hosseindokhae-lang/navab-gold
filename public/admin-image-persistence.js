(()=>{
'use strict';
const originalFetch=window.fetch.bind(window);
const isDataImage=v=>typeof v==='string' && /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(v);
async function upload(data){
 const r=await originalFetch('/api/admin/upload-image',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(localStorage.getItem('navab_admin_token')||'')},body:JSON.stringify({data})});
 const j=await r.json().catch(()=>({}));
 if(!r.ok||!j.ok)throw Error(j.error||'ذخیره عکس ناموفق بود');
 return j.url;
}
async function walk(v){
 if(Array.isArray(v))return Promise.all(v.map(walk));
 if(v&&typeof v==='object'){const o={};for(const[k,x]of Object.entries(v))o[k]=isDataImage(x)?await upload(x):await walk(x);return o}
 return v;
}
window.fetch=async function(input,init={}){
 const url=typeof input==='string'?input:(input?.url||'');
 const method=String(init?.method||input?.method||'GET').toUpperCase();
 if(method==='PUT'&&/\/api\/storage\/(products|catalog|priceRanges)(?:\?|$)/.test(url)){
  const body=init.body;
  if(typeof body==='string'){
   const payload=JSON.parse(body);
   if(payload?.value){const parsed=typeof payload.value==='string'?JSON.parse(payload.value):payload.value;payload.value=JSON.stringify(await walk(parsed));init={...init,body:JSON.stringify(payload)}}
  }
 }
 return originalFetch(input,init);
};
})();
