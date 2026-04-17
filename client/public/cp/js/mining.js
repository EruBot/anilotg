import { tg, API } from './main.js';

let timer = null;
const RATE = 20000;
const MAX = 20000;
const PER_SEC = RATE / 3600;

export async function loadMining() {
  clearInterval(timer);
  
  const content = document.getElementById('content');
  content.className = '';
  content.innerHTML = `
    <div class="mining-wrap" style="padding:16px;max-width:480px;margin:0 auto">
      <h3 style="margin:0 0 12px;font-size:18px">⛏️ Mining Point (MP)</h3>
      
      <div id="mp-big" style="font-size:32px;font-weight:800;letter-spacing:0.5px">0 MP</div>
      <div id="mp-sub" style="opacity:.75;margin:4px 0 10px;font-size:14px">0 / 20.000</div>
      
      <div style="height:10px;background:#1a1a1a;border-radius:6px;overflow:hidden;margin:8px 0 10px;border:1px solid #2a2a2a">
        <div id="mp-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#a855f7,#ec4899);transition:width 0.5s"></div>
      </div>
      
      <div id="mp-timer" style="font-size:13px;opacity:.8;margin-bottom:14px">Loading...</div>
      
      <button id="btn-claim" style="width:100%;padding:12px;border:0;border-radius:10px;background:#7c3aed;color:#fff;font-weight:700;font-size:15px">CLAIM & SYNC</button>

      <div style="margin-top:28px;border-top:1px solid #2a2a2a;padding-top:18px">
        <h4 style="margin:0 0 8px;font-size:16px">Tukar ke CP</h4>
        <div style="font-size:13px;opacity:.7;margin-bottom:8px">Rate: <b>100 MP = 1 CP</b> • Tidak masuk leaderboard harian</div>
        
        <div style="display:flex;gap:8px">
          <input id="inp-mp" type="number" step="100" min="100" value="100" 
                 style="flex:1;padding:10px;background:#0f0f0f;border:1px solid #333;border-radius:8px;color:#fff;font-size:15px">
          <button id="btn-convert" style="padding:10px 16px;background:#222;border:1px solid #444;border-radius:8px;color:#fff;font-weight:600">Tukar</button>
        </div>
        <div id="convert-info" style="font-size:12px;opacity:.6;margin-top:6px">Cooldown 5 detik</div>
      </div>
    </div>
  `;

  let mp = 0, last = Date.now();

  // --- AMBIL DATA ---
  try {
    const url = `${API}/mining?action=status&initData=${encodeURIComponent(tg.initData || '')}`;
    const r = await fetch(url, { method: 'GET', mode: 'cors' });
    const text = await r.text();
    if (!r.ok) throw new Error(`Server ${r.status}`);
    const j = JSON.parse(text);
    if (j.error) throw new Error(j.error);

    mp = Number(j.mp_balance) || 0;
    last = new Date(j.last_claim_at).getTime() || Date.now();
    document.getElementById('mp-timer').textContent = 'Sinkron...';
  } catch (e) {
    document.getElementById('mp-big').textContent = 'ERROR';
    document.getElementById('mp-timer').textContent = 'Gagal: ' + e.message;
    console.error(e);
    return;
  }

  const elBig = document.getElementById('mp-big');
  const elSub = document.getElementById('mp-sub');
  const elBar = document.getElementById('mp-bar');
  const elTimer = document.getElementById('mp-timer');
  const inpMp = document.getElementById('inp-mp');
  const btnConvert = document.getElementById('btn-convert');
  const btnClaim = document.getElementById('btn-claim');

  function updateDisplay() {
    const now = Date.now();
    const elapsed = Math.max(0, (now - last) / 1000);
    let cur = Math.min(mp + elapsed * PER_SEC, MAX);
    const curFloor = Math.floor(cur);

    elBig.textContent = curFloor.toLocaleString('id-ID') + ' MP';
    elSub.textContent = `${curFloor.toLocaleString('id-ID')} / 20.000`;
    elBar.style.width = (cur / MAX * 100) + '%';

    const remain = MAX - cur;
    if (remain <= 0.5) {
      elTimer.textContent = 'PENUH — Claim untuk reset timer';
    } else {
      const sec = Math.floor(remain / PER_SEC);
      elTimer.textContent = `Penuh dalam ${Math.floor(sec/60)}m ${sec%60}d`;
    }

    // update input convert
    inpMp.max = curFloor;
    inpMp.value = Math.min(Number(inpMp.value) || 100, Math.max(100, Math.floor(curFloor/100)*100));
    btnConvert.disabled = curFloor < 100;
    btnConvert.style.opacity = curFloor < 100 ? '0.5' : '1';
  }

  updateDisplay();
  timer = setInterval(updateDisplay, 1000);

  // CLAIM
  btnClaim.onclick = async () => {
    btnClaim.disabled = true;
    btnClaim.textContent = 'Syncing...';
    try {
      await fetch(`${API}/mining?action=claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData })
      });
      // reload data dari server
      const r = await fetch(`${API}/mining?action=status&initData=${encodeURIComponent(tg.initData)}`);
      const j = await r.json();
      mp = Number(j.mp_balance) || 0;
      last = new Date(j.last_claim_at).getTime();
      tg.HapticFeedback?.notificationOccurred('success');
    } catch {}
    btnClaim.disabled = false;
    btnClaim.textContent = 'CLAIM & SYNC';
    updateDisplay();
  };

  // CONVERT
  let lastConvert = 0;
  btnConvert.onclick = async () => {
    const now = Date.now();
    if (now - lastConvert < 5000) {
      tg.showAlert('Tunggu 5 detik');
      return;
    }
    const val = parseInt(inpMp.value);
    if (!val || val < 100 || val % 100 !== 0) {
      tg.showAlert('Minimal 100 kelipatan 100');
      return;
    }

    lastConvert = now;
    btnConvert.disabled = true;
    btnConvert.textContent = '...';

    try {
      const r = await fetch(`${API}/mining?action=convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData, mp: val })
      });
      const j = await r.json();
      if (j.ok) {
        tg.showAlert(`Berhasil tukar ${val} MP → ${j.cp} CP`);
        // reload
        const rs = await fetch(`${API}/mining?action=status&initData=${encodeURIComponent(tg.initData)}`);
        const js = await rs.json();
        mp = Number(js.mp_balance) || 0;
        last = new Date(js.last_claim_at).getTime();
        updateDisplay();
      } else {
        tg.showAlert(j.error || 'Gagal tukar');
      }
    } catch (e) {
      tg.showAlert('Error: ' + e.message);
    }
    btnConvert.disabled = false;
    btnConvert.textContent = 'Tukar';
  };
}
