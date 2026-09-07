(()=>{
'use strict';
function clean(){['priceRangeManager','brandCopyManager','siteSettingsManager'].forEach(id=>document.getElementById(id)?.remove())}
function patch(){
 clean();
 if(window.__navabAddRefresh)return;
 if(typeof window.addProduct==='function'){
   const original=window.addProduct;
   window.addProduct=async function(...args){
     const result=await original.apply(this,args);
     setTimeout(()=>location.reload(),250);
     return result;
   };
   window.__navabAddRefresh=true;
 }
}
function watchEdit(){
 document.addEventListener('click',e=>{
   if(e.target?.id!=='epSave')return;
   const timer=setInterval(()=>{
     const modal=document.getElementById('productEditModal');
     if(!modal){clearInterval(timer);setTimeout(()=>location.reload(),150);}
   },150);
   setTimeout(()=>clearInterval(timer),10000);
 },true);
}
function boot(){patch();watchEdit();setTimeout(clean,1600)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));else setTimeout(boot,900);
})();