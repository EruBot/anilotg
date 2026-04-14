import { API, CHAT_ID, state } from './main.js';

const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const content = document.getElementById('content');
const boardControls = document.getElementById('board-controls');

export async function loadBoard(){
  title.textContent='Leaderboard Chat Point';
  subtitle.textContent='Anime Lovers Indo';
  boardControls.style.display='flex';
  content.innerHTML='<div class="loading">Loading...</div>';
  try{
    const r = await fetch(`${API}/leaderboard?chat_id=${CHAT_ID}&type=cp&period=${state.period}`);
    const d = await r.json();
    content.innerHTML = (d.rows||[]).map(x=>`
      <div class="card row">
        <div class="rank">#${x.rank}</div>
        <div style="flex:1"><div class="name">${x.display_name}</div>${x.username?`<div class="user">@${x.username}</div>`:''}</div>
        <div class="val">${Number(x.value).toLocaleString('id-ID')}</div>
      </div>`).join('') || '<div class="loading">Kosong</div>';
  }catch{ content.innerHTML='<div class="loading">Error</div>'; }
}
