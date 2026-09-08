const cp=require('child_process');
const path=require('path');
const originalSpawn=cp.spawn;
cp.spawn=function(command,args,options={}){
  const list=Array.isArray(args)?args:[];
  if(list.includes('server.js')){
    const env={...(options.env||process.env)};
    const patch=path.join(__dirname,'server-patch.js');
    env.NODE_OPTIONS=[env.NODE_OPTIONS||'',`-r ${patch}`].filter(Boolean).join(' ');
    options={...options,env};
  }
  return originalSpawn.call(cp,command,args,options);
};
