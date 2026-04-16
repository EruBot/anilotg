// board.js - compact anime
import { API, CHAT_ID, state } from './main.js';

const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const content = document.getElementById('content');
const boardControls = document.getElementById('board-controls');

const topStyle = {
  1: { bg: 'linear-gradient(135deg,#ffd700,#ffb700)', c: '#000' },
  2: { bg: 'linear-gradient(135deg,#d4d4d8,#a1a1aa)', c: '#000' },
  3: { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', c: '#000' }
};

export async function loadBoard(){
  title.textContent = 'Leaderboard';
  subtitle.textContent = 'Anime Lovers Indo';
  boardControls.style.display = 'flex';
  content.innerHTML = `<div class="loading">memuat...</div>`;

  try{
    const r = await fetch(`${API}/leaderboard?chat_id=${CHAT_ID}&type=cp&period=${state.period}`);
    const d = await r.json();
    const rows = d.rows || [];

    if(!rows.length){
      content.innerHTML = `<div class="card" style="text-align:center;padding:20px">Kosong</div>`;
      return;
    }

    content.innerHTML = rows.map((x,i)=>{
      const rank = Number(x.rank);
      const t = topStyle[rank];
      return `
      <div class="card" style="
        display:flex;align-items:center;gap:10px;
        padding:10px 12px;margin-bottom:8px;
        border-radius:14px;background:rgba(255,255,255,.05);
        border:1px solid ${t? 'rgba(255,215,0,.4)' : 'rgba(255,255,255,.08)'};
        ${t? `box-shadow:0 0 12px ${t.bg.match(/#[a-f0-9]{6}/)[0]}30` : ''}
      ">
        <div style="
          width:28px;height:28px;flex:0 0 28px;
          display:grid;place-items:center;border-radius:8px;
          font:700 12px 'Space Grotesk';
          background:${t? t.bg : 'rgba(255,255,255,.08)'};color:${t? t.c : '#9aa3c7'};
        ">${rank<=3? ['🥇','🥈','🥉'][rank-1] : rank}</div>

        <img src="https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(x.username||x.display_name)}&size=64"
          style="width:32px;height:32px;border-radius:8px;background:#0b1020;border:1px solid rgba(255,255,255,.1)">

        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.display_name)}</div>
          <div style="font-size:11px;color:#8fa0c7;margin-top:1px">@${esc(x.username||'-')}</div>
        </div>

        <div style="font:800 15px 'Space Grotesk';color:#7dd3fc;white-space:nowrap">${Number(x.value).toLocaleString('id-ID')}</div>
      </div>`;
    }).join('');

  }catch(e){
    content.innerHTML = `<div class="card" style="text-align:center;color:#ff6b6b">Error</div>`;
  }
}

function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
