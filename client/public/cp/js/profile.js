import { API, CHAT_ID, state, tg } from './main.js';

const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const content = document.getElementById('content');
const boardControls = document.getElementById('board-controls');

export async function loadProfile(){
  title.textContent='Profile';
  subtitle.textContent=`@${tg.initDataUnsafe?.user?.username || tg.initDataUnsafe?.user?.first_name || ''}`;
  boardControls.style.display='none';
  content.innerHTML='<div class="loading">Loading profile...</div>';
  const r = await fetch(`${API}/profile?chat_id=${CHAT_ID}`,{headers:{'X-Telegram-Init-Data':tg.initData}});
  const d = await r.json();
  const u = d.user; state.myProfile = u;
  content.innerHTML = `
    <div class="card" style="text-align:center;padding:24px">
      <img src="https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(u.username||u.first_name)}" style="width:84px;height:84px;border-radius:18px;border:3px solid #0ea5e9">
      <h3 style="margin:12px 0 4px">${u.first_name}</h3>
      <div class="user">@${u.username || u.user_id} • ID: ${u.user_id}</div>
    </div>
    <div class="grid">
      <div class="card"><div class="user">🏆 Rank</div><div style="font-weight:800;font-size:18px;margin-top:4px">${u.current_rank}</div></div>
      <div class="card"><div class="user">📊 CP Minggu</div><div style="font-weight:800;font-size:18px;margin-top:4px">${Number(u.cp_mingguan).toLocaleString('id-ID')}</div></div>
      <div class="card"><div class="user">💬 Chat Minggu</div><div style="font-weight:800;font-size:18px;margin-top:4px">${Number(u.chat_mingguan).toLocaleString('id-ID')}</div></div>
      <div class="card"><div class="user">💬 Total Chat</div><div style="font-weight:800;font-size:18px;margin-top:4px">${Number(u.total_chat).toLocaleString('id-ID')}</div></div>
    </div>
    <div class="big"><div style="font-size:12px;opacity:.85">⚡ TOTAL CP</div><div style="font-size:30px;font-weight:900;margin-top:4px">${Number(u.total_cp).toLocaleString('id-ID')}</div></div>
    ${u.game_taps!==undefined?`<div class="card" style="margin-top:12px;text-align:center"><div class="user">Game Taps</div><div style="font-weight:700">${Number(u.game_taps).toLocaleString('id-ID')}</div></div>`:''}
  `;
}
