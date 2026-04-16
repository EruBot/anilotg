import { API, CHAT_ID, state, tg } from './main.js';

const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const content = document.getElementById('content');
const boardControls = document.getElementById('board-controls');

export async function loadProfile() {
  title.textContent = 'Profile';
  const u = tg.initDataUnsafe?.user || {};
  subtitle.textContent = `@${u.username || u.first_name || ''}`;
  boardControls.style.display = 'none';
  content.innerHTML = '<div class="loading">Loading profile...</div>';

  const userId = u.id;
  const chatId = CHAT_ID || '-1001236366475'; // SAMAKAN dengan ID grup bot

  try {
    const r = await fetch(`${API}/profile?chat_id=${chatId}&user_id=${userId}`, {
      headers: { 'X-Telegram-Init-Data': tg.initData || '' }
    });
    const d = await r.json();
    const p = d.user; 
    state.myProfile = p;

    content.innerHTML = `
      <div class="card" style="text-align:center;padding:24px">
        <img src="https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(p.username || p.first_name)}" style="width:84px;height:84px;border-radius:18px;border:3px solid #0ea5e9">
        <h3 style="margin:12px 0 4px">${p.first_name}</h3>
        <div class="user">@${p.username || p.user_id} • ID: ${p.user_id}</div>
      </div>
      <div class="grid">
        <div class="card"><div class="user">🏆 Rank</div><div style="font-weight:800;font-size:18px;margin-top:4px">${p.current_rank}</div></div>
        <div class="card"><div class="user">📊 CP Minggu</div><div style="font-weight:800;font-size:18px;margin-top:4px">${Number(p.cp_mingguan).toLocaleString('id-ID')}</div></div>
        <div class="card"><div class="user">💬 Chat Minggu</div><div style="font-weight:800;font-size:18px;margin-top:4px">${Number(p.chat_mingguan).toLocaleString('id-ID')}</div></div>
        <div class="card"><div class="user">💬 Total Chat</div><div style="font-weight:800;font-size:18px;margin-top:4px">${Number(p.total_chat).toLocaleString('id-ID')}</div></div>
      </div>
      <div class="big"><div style="font-size:12px;opacity:.85">⚡ TOTAL CP</div><div style="font-size:30px;font-weight:900;margin-top:4px">${Number(p.total_cp).toLocaleString('id-ID')}</div></div>
    `;
  } catch (e) {
    content.innerHTML = `<div class="card">Gagal load profile: ${e.message}</div>`;
  }
}
