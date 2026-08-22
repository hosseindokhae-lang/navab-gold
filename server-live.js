const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const PUBLIC_PORT = Number(process.env.PORT || 3000);
const APP_PORT = PUBLIC_PORT + 1;
const TALA_URLS = [process.env.TALA_WS_URL || 'wss://web1.tala.ir/ws/'];

let liveMarket = null;
let lastLiveAt = 0;
let socket = null;
let reconnectTimer = null;
let lastError = null;
let messages = 0;

const keys = {
  gram18: ['geram18','gram18'], gram21: ['geram21','gram21'], gram22: ['geram22','gram22'],
  gram735: ['geram735','gram735'], gram740: ['geram740','gram740'], gram995: ['geram995','gram995'],
  gram999: ['geram999','gram999'], usd: ['usd'], eur: ['eur'], gbp: ['gbp'], aed: ['aed'],
  btcUsd: ['BTC_USDT','btcUsd'], ethUsd: ['ETH_USDT','ethUsd'], usdtIrt: ['USDT_IRT','usdtIrt'],
  ounceUsd: ['ounce','ounceUsd'], brentUsd: ['ENERGY_BRENT','brentUsd'], bazartehran: ['bazartehran'],
  mazanehJahani: ['mazaneh-jahani','mazanehJahani'], mazanehDubai: ['mazaneh-dubai','mazanehDubai'],
  emami: ['sekkejad','emami'], oldCoin: ['sekkegad','oldCoin'], half: ['sekkenim','half'],
  quarter: ['sekkerob','quarter'], gerami: ['sekkegrm','gerami'], coinValue: ['sekke-arzesh','coinValue'],
  coinBubble: ['sekke-hobab','coinBubble']
};

function num(v){
  if(v === null || v === undefined || v === '') return null;
  const s = String(v).replace(/,/g,'').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function walk(value, out){
  if(!value || typeof value !== 'object') return;
  if(Array.isArray(value)){ for(const x of value) walk(x,out); return; }
  for(const [k,v] of Object.entries(value)){
    if(v && typeof v === 'object' && !Array.isArray(v) && 'value' in v){
      const n = num(v.value);
      if(n !== null) out[k] = n;
    } else {
      const n = num(v);
      if(n !== null) out[k] = n;
    }
    if(v && typeof v === 'object') walk(v,out);
  }
}

function normalize(payload){
  const raw = {};
  walk(payload, raw);
  const out = {};
  for(const [target, aliases] of Object.entries(keys)){
    for(const alias of aliases){
      if(raw[alias] !== undefined){ out[target] = raw[alias]; break; }
      const hit = Object.keys(raw).find(k => k.toLowerCase() === alias.toLowerCase());
      if(hit){ out[target] = raw[hit]; break; }
    }
  }
  return out;
}

function connect(){
  clearTimeout(reconnectTimer);
  const url = TALA_URLS[0];
  try{
    if(socket) socket.close();
    socket = new WebSocket(url, { headers: { Origin:'https://www.tala.ir', 'User-Agent':'Mozilla/5.0 NavabGold/1.0' } });
    socket.on('open', () => { lastError = null; console.log('[TALA LIVE] connected', url); });
    socket.on('message', raw => {
      messages++;
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      const normalized = normalize(msg);
      if(normalized.gram18 || normalized.gram740 || normalized.usd || normalized.ounceUsd){
        liveMarket = { ...(liveMarket || {}), ...normalized };
        lastLiveAt = Date.now();
        lastError = null;
      }
    });
    socket.on('error', e => { lastError = e.message || 'Tala WebSocket error'; });
    socket.on('close', () => {
      socket = null;
      reconnectTimer = setTimeout(connect, 2500);
    });
  }catch(e){
    lastError = e.message || 'Tala WebSocket connection failed';
    reconnectTimer = setTimeout(connect, 2500);
  }
}
connect();

function sendMarket(res){
  const fresh = !!liveMarket && (Date.now() - lastLiveAt < 90000);
  if(!fresh){
    res.writeHead(503, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
    return res.end(JSON.stringify({ok:false,live:false,source:'Tala.ir WebSocket',updatedAt:lastLiveAt||null,error:lastError||'دریافت قیمت زنده از طلا موقتاً ممکن نشد.'}));
  }
  res.writeHead(200, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify({ok:true,live:true,source:'Tala.ir WebSocket',updatedAt:lastLiveAt,market:liveMarket}));
}

const child = spawn(process.execPath, ['server.js'], { env:{...process.env, PORT:String(APP_PORT)}, stdio:'inherit' });
child.on('exit', code => { if(code !== 0) process.exit(code || 1); });

const proxy = http.createServer((req,res) => {
  if(req.url && req.url.startsWith('/api/market')) return sendMarket(res);
  const upstream = http.request({hostname:'127.0.0.1',port:APP_PORT,path:req.url,method:req.method,headers:{...req.headers,host:`127.0.0.1:${APP_PORT}`}}, r => {
    res.writeHead(r.statusCode, r.headers); r.pipe(res);
  });
  upstream.on('error', () => { if(!res.headersSent){res.writeHead(502);res.end('Bad gateway');} });
  req.pipe(upstream);
});
proxy.listen(PUBLIC_PORT, '0.0.0.0', () => console.log('[NAVAB] live market proxy listening on', PUBLIC_PORT));

process.on('SIGTERM', () => { try{child.kill('SIGTERM');}catch{}; try{socket?.close();}catch{}; process.exit(0); });
process.on('SIGINT', () => { try{child.kill('SIGINT');}catch{}; try{socket?.close();}catch{}; process.exit(0); });
