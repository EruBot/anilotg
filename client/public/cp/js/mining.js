import { tg, API } from './main.js';

let timer = null;
let lastConvert = 0;
const RATE = 20000; // MP per jam
const MAX = 20000;
const RATE_PER_SEC = RATE / 3600;

export async function loadMining() {
  clearInterval(timer);
  const content = document.getElementById('content');
  content.className = '';
  content.innerHTML = `
    <div class="mining-wrap">
      <h3>⛏️ Mining Point (MP)</h3>
      <div class="mp-box">
        <div class="mp-big" id="mp-balance">0 MP</div>
        <div class="mp-sub" id="mp-rate">0 / 20.000 (max 1 jam)</div>
        <div class="progress"><div id="mp-bar"></div></div>
        <div id="mp-timer" class="timer">Menghitung...</div>
      </div>
      <button id="btn-claim" class="btn-primary">CLAIM MP</button>

      <div class="convert-box">
        <h4>Tukar ke CP</h4>
        <div>Rate: <b>100 MP = 1 CP</b></div>
        <div class="convert-row">
          <input id="inp-mp" type="number" placeholder="100" min="100" step="100">
          <button id="btn-convert">Tukar</button>
        </div>
        <div id="convert-info" class="small">Cooldown 5 detik</div>
      </div>
    </div>
  `;

  // ambil status dari server
  const res = await fetch(`${API}/miniapp/mining?initData=${encodeURIComponent(tg.initData)}`);
  const data = await res.json();

  let { mp_balance, last_claim_at, server_now } = data;
  const serverOffset = Date.now() - new Date(server_now).getTime();
  const startTime = new Date(last_claim_at).getTime();

  function updateDisplay() {
    const now = Date.now() - serverOffset;
    const elapsedSec = Math.max(0, (now - startTime) / 1000);
    let current = Math.min(mp_balance + elapsedSec * RATE_PER_SEC, MAX);

    document.getElementById('mp-balance').textContent = Math.floor(current).toLocaleString('id-ID') + ' MP';
    document.getElementById('mp-rate').textContent = `${Math.floor(current).toLocaleString()} / 20.000`;
    document.getElementById('mp-bar').style.width = (current/MAX*100) + '%';

    const remain = MAX - current;
    if (remain <= 0) {
      document.getElementById('mp-timer').textContent = 'PENUIH! Claim sekarang';
      document.getElementById('btn-claim').disabled = false;
    } else {
      const secLeft = remain / RATE_PER_SEC;
      const m = Math.floor(secLeft/60), s = Math.floor(secLeft%60);
      document.getElementById('mp-timer').textContent = `Penuh dalam ${m}m ${s}d`;
    }
  }

  updateDisplay();
  timer = setInterval(updateDisplay, 1000); // animasi 1 detik

  document.getElementById('btn-claim').onclick = async () => {
    const r = await fetch(`${API}/mining/claim`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({initData: tg.initData})
    });
    const j = await r.json();
    if(j.ok) loadMining(); else tg.showAlert(j.error);
  };

  document.getElementById('btn-convert').onclick = async () => {
    const now = Date.now();
    if (now - lastConvert < 5000) return tg.showAlert('Tunggu 5 detik!');
    lastConvert = now;

    const mp = parseInt(document.getElementById('inp-mp').value) || 0;
    if (mp < 100 || mp % 100!== 0) return tg.showAlert('Minimal 100 dan kelipatan 100');

    const r = await fetch(`${API}/miniapp/mining/convert`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({initData: tg.initData, mp})
    });
    const j = await r.json();
    if(j.ok) {
      tg.showAlert(`Berhasil! ${mp} MP → ${mp/100} CP (masuk TOTAL)`);
      loadMining();
    } else tg.showAlert(j.error);
  };
}
