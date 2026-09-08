const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const originalCreateServer=http.createServer;
const root=process.env.DATA_DIR||process.env.RAILWAY_VOLUME_MOUNT_PATH||path.join(__dirname,'data');
const uploadDir=path.join(root,'uploads');
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
http.createServer=function(handler){return originalCreateServer.call(http,async(req,res)=>{
 try{
  const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  if(u.pathname==='/api/admin/upload-image'&&req.method==='POST'){
   const auth=String(req.headers.authorization||'');
   if(!/^Bearer\s+[a-f0-9]{32,}$/i.test(auth))return send(res,401,{ok:false,error:'Unauthorized'});
   let s='';req.on('data',c=>{s+=c;if(s.length>12*1024*1024)req.destroy()});
   return req.on('end',()=>{try{const b=JSON.parse(s||'{}'),data=String(b.data||''),m=data.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);if(!m)return send(res,400,{ok:false,error:'تصویر نامعتبر است'});fs.mkdirSync(uploadDir,{recursive:true});const ext=m[1].toLowerCase()==='jpg'?'jpg':m[1].toLowerCase(),name=`${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;fs.writeFileSync(path.join(uploadDir,name),Buffer.from(m[2],'base64'));return send(res,201,{ok:true,url:`/uploads/${name}`,name});}catch(e){return send(res,400,{ok:false,error:'آپلود تصویر ناموفق بود'})}});
  }
  if(u.pathname.startsWith('/uploads/')&&req.method==='GET'){
   const name=decodeURIComponent(u.pathname.slice('/uploads/'.length)).replace(/[^a-zA-Z0-9._-]/g,'_');const file=path.join(uploadDir,name);return fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}const ext=path.extname(file).toLowerCase(),types={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'};res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'public, max-age=31536000, immutable'});res.end(data)});
  }
 }catch(e){}
 return handler(req,res);
})};
