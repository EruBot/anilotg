// profile.js
import { API, CHAT_ID, state, tg } from './main.js';

const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const content = document.getElementById('content');
const boardControls = document.getElementById('board-controls');

export async function loadProfile() {
  // header
  title.textContent = 'Profile';
  const u = tg.initDataUnsafe?.user || {};
  subtitle.textContent = `@${u.username || u.first_name || 'user'}`;
  boardControls.style.display = 'none';

  // loading
  content.innerHTML = `<div class="loading">memuat data...</div>`;

  try {
    const userId = u.id;
    if (!userId) throw new Error('User Telegram tidak terdeteksi');

    // pakai cache kalau ada, tapi tetap refresh untuk sinkron
    const r = await fetch(`${API}/profile?chat_id=${CHAT_ID}&user_id=${userId}`, {
      headers: { 'X-Telegram-Init-Data': tg.initData || '' }
    });

    if (!r.ok) throw new Error(`API error ${r.status}`);
    const data = await r.json();
    if (!data.ok) throw new Error(data.error || 'Gagal load');

    const p = data.user;
    state.myProfile = p; // simpan untuk game

    // render UI anime
    content.innerHTML = `
      <div class="card hero">
        <div class="avatar">
          <img src="https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(p.username || p.first_name || p.user_id)}&backgroundColor=0b1020&scale=90" alt="avatar">
        </div>
        <h3>${escapeHtml(p.first_name || 'User')}</h3>
        <div class="meta">@${escapeHtml(p.username || '-')} • ID ${p.user_id}</div>
      </div>

      <div class="grid">
        <div class="stat">
          <div class="label">🏆 Rank</div>
          <div class="value">${escapeHtml(p.current_rank || '-')}</div>
        </div>
        <div class="stat">
          <div class="label">📊 CP Minggu</div>
          <div class="value">${fmt(p.cp_mingguan)}</div>
        </div>
        <div class="stat">
          <div class="label">💬 Chat Minggu</div>
          <div class="value">${fmt(p.chat_mingguan)}</div>
        </div>
        <div class="stat">
          <div class="label">💬 Total Chat</div>
          <div class="value">${fmt(p.total_chat)}</div>
        </div>
      </div>

      <div class="big">
        <div class="t">⚡ TOTAL CP</div>
        <div class="v">${fmt(p.total_cp)}</div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    content.innerHTML = `
      <div class="card" style="text-align:center">
        <div style="font-weight:700;margin-bottom:6px">Gagal memuat profile</div>
        <div style="font-size:12px;color:var(--muted)">${escapeHtml(err.message)}</div>
      </div>
    `;
  }
}

// helper
function fmt(n){
  const num = Number(n || 0);
  return num.toLocaleString('id-ID');
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
