// shop.js - Anime Shop (placeholder)
import { API, CHAT_ID, state, tg } from './main.js';

const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const content = document.getElementById('content');
const boardControls = document.getElementById('board-controls');

export async function loadShop() {
  title.textContent = 'Shop';
  subtitle.textContent = 'Tukar CP dengan item keren';
  boardControls.style.display = 'none';

  // nanti kalau item sudah ada, fetch dari API di sini
  // const r = await fetch(`${API}/shop?chat_id=${CHAT_ID}`);
  // const items = await r.json();

  const user = tg.initDataUnsafe?.user || {};
  const cp = state.myProfile?.total_cp || 0;

  content.innerHTML = `
    <div class="card" style="text-align:center;padding:24px;margin-bottom:12px">
      <div style="font-size:12px;color:var(--muted)">Saldo kamu</div>
      <div style="font:800 24px 'Space Grotesk';margin-top:4px;background:linear-gradient(90deg,var(--pink),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent">
        ${Number(cp).toLocaleString('id-ID')} CP
      </div>
    </div>

    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
      ${[1,2,3,4].map(i => `
        <div class="card" style="padding:14px;text-align:center;opacity:.7">
          <div style="width:56px;height:56px;margin:0 auto 8px;border-radius:14px;background:rgba(255,255,255,.06);display:grid;place-items:center;font-size:24px">🎁</div>
          <div style="font-weight:700;font-size:13px;color:#fff">Item #${i}</div>
          <div style="font-size:11px;color:var(--muted);margin:4px 0 8px">Segera hadir</div>
          <div style="font:700 12px 'Space Grotesk';color:var(--muted)">--- CP</div>
        </div>
      `).join('')}
    </div>

    <div class="card" style="margin-top:14px;text-align:center;padding:30px 20px;background:rgba(123,92,255,.08);border:1px dashed rgba(123,92,255,.4)">
      <div style="font-size:32px;margin-bottom:8px">✨</div>
      <div style="font:700 16px 'Space Grotesk';color:#fff;margin-bottom:4px">Shop Coming Soon</div>
      <div style="font-size:12px;color:var(--muted);line-height:1.5">
        Item, role khusus, dan boost CP akan bisa dibeli di sini.<br>
        Untuk sekarang kumpulin CP dulu ya, @${user.username || 'kamu'}!
      </div>
    </div>
  `;
}
