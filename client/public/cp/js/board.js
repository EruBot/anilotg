// board.js - Anime Leaderboard
import { API, CHAT_ID, state } from './main.js';

const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const content = document.getElementById('content');
const boardControls = document.getElementById('board-controls');

const medals = {
  1: { icon: '👑', color: 'linear-gradient(135deg,#ffd700,#ffae00)', glow: '#ffd70060' },
  2: { icon: '🥈', color: 'linear-gradient(135deg,#c0c0c0,#a0a0a0)', glow: '#c0c0c060' },
  3: { icon: '🥉', color: 'linear-gradient(135deg,#cd7f32,#a05a2c)', glow: '#cd7f3260' }
};

export async function loadBoard(){
  title.textContent = 'Leaderboard';
  subtitle.textContent = 'Anime Lovers Indo';
  boardControls.style.display = 'flex';

  content.innerHTML = `<div class="loading">memuat ranking...</div>`;

  try {
    const r = await fetch(`${API}/leaderboard?chat_id=${CHAT_ID}&type=cp&period=${state.period}`);
    if (!r.ok) throw new Error('API error');
    const d = await r.json();
    const rows = d.rows || [];

    if (rows.length === 0) {
      content.innerHTML = `<div class="card" style="text-align:center;padding:30px;color:var(--muted)">Belum ada data</div>`;
      return;
    }

    content.innerHTML = rows.map((x, i) => {
      const rank = Number(x.rank);
      const isTop3 = rank <= 3;
      const medal = medals[rank];
      const delay = i * 40;

      return `
        <div class="card row" style="animation:fadeIn.4s ease ${delay}ms both; ${isTop3? `border-color:${medal.glow};box-shadow:0 0 20px ${medal.glow}` : ''}">

          <div class="rank" style="
            width:44px;height:44px;display:grid;place-items:center;border-radius:12px;
            font-weight:800;font-size:${isTop3? '18px' : '14px'};
            background:${isTop3? medal.color : 'rgba(255,255,255,.06)'};
            color:${isTop3? '#000' : 'var(--muted)'};
            box-shadow:${isTop3? `0 0 15px ${medal.glow}` : 'none'};
          ">${isTop3? medal.icon : `#${rank}`}</div>

          <div style="width:38px;height:38px;border-radius:10px;overflow:hidden;border:2px solid rgba(255,255,255,.1);background:#0b1020">
            <img src="https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(x.username || x.display_name)}&scale=90" style="width:100%;height:100%" alt="">
          </div>

          <div style="flex:1;min-width:0">
            <div class="name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff;font-weight:700">${escapeHtml(x.display_name)}</div>
            ${x.username? `<div class="user" style="color:var(--muted)">@${escapeHtml(x.username)}</div>` : ''}
          </div>

          <div class="val" style="
            font:800 18px 'Space Grotesk';
            background:linear-gradient(90deg,var(--cyan),var(--violet));
            -webkit-background-clip:text;background-clip:text;color:transparent;
          ">${Number(x.value).toLocaleString('id-ID')}</div>
        </div>
      `;
    }).join('');

    // inject animasi sekali
    if (!document.getElementById('board-anim')) {
      const st = document.createElement('style');
      st.id = 'board-anim';
      st.textContent = `@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`;
      document.head.appendChild(st);
    }

  } catch (e) {
    console.error(e);
    content.innerHTML = `<div class="card" style="text-align:center;color:#ff6b6b">Gagal memuat leaderboard</div>`;
  }
}

function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
