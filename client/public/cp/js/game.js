import { API, CHAT_ID, state, tg } from './main.js';

const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const content = document.getElementById('content');
const boardControls = document.getElementById('board-controls');

const COOLDOWN_MS = 167; // <--- UBAH DI SINI, 200 = 0.2 detik

export async function loadGame(){
  title.textContent='Tap Game';
  subtitle.textContent=`1 tap = 1 CP • cooldown ${COOLDOWN_MS}ms`;
  boardControls.style.display='none';
  
  if(!state.myProfile){
    const r = await fetch(`${API}/profile?chat_id=${CHAT_ID}`,{headers:{'X-Telegram-Init-Data':tg.initData}});
    state.myProfile = (await r.json()).user;
  }
  const cp = state.myProfile.total_cp||0;
  content.innerHTML = `
    <div class="game-wrap">
      <div class="counter" id="cp">${Number(cp).toLocaleString('id-ID')}</div>
      <div style="opacity:.7">Total CP kamu</div>
      <div class="tap-btn" id="tap">TAP</div>
      <div id="status" style="height:22px;opacity:.8;margin-top:8px"></div>
    </div>`;
  document.getElementById('tap').onclick = doTap;
}

async function doTap(){
  const now = Date.now();
  const status = document.getElementById('status');
  if(now - state.lastTap < COOLDOWN_MS){
    const wait = COOLDOWN_MS - (now - state.lastTap);
    status.textContent = `Tunggu ${wait}ms`;
    status.className='text-amber-300';
    tg.HapticFeedback?.notificationOccurred('warning');
    return;
  }
  state.lastTap = now;
  const btn = document.getElementById('tap'); btn.style.transform='scale(.92)'; setTimeout(()=>btn.style.transform='',90);
  
  const r = await fetch(`${API}/tap`,{method:'POST',headers:{'X-Telegram-Init-Data':tg.initData}});
  const d = await r.json();
  if(d.ok){
    state.myProfile.total_cp = d.total_cp;
    document.getElementById('cp').textContent = Number(d.total_cp).toLocaleString('id-ID');
    status.textContent = '+1 CP!'; tg.HapticFeedback?.impactOccurred('light');
  } else { status.textContent = 'Terlalu cepat!'; }
}
