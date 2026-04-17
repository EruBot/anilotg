import { tg, API } from './main.js';

let timer = null;
const RATE = 20000;
const MAX = 20000;
const PER_SEC = RATE / 3600;

export async function loadMining() {
  clearInterval(timer);
  const content = document.getElementById('content');
  content.className = '';
  // BERSIHIN TOTAL, jangan sisain Tap Game
  content.innerHTML = `
    <div class="mining-wrap" style="padding:16px">
      <h3 style="margin:0 0 12px">⛏️ Mining Point (MP)</h3>
      <div id="mp-big" style="font-size:28px;font-weight:700">0 MP</div>
      <div id="mp-sub" style="opacity:.8;margin:4px 0">0 / 20.000</div>
      <div style="height:8px;background:#222;border-radius:4px;overflow:hidden;margin:8px 0">
        <div id="mp-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#a855f7,#ec4899)"></div>
      </div>
      <div id="mp-timer" style="font-size:13px;margin-bottom:12px">Loading...</div>
      <button id="btn-claim" style="padding:10px 16px;border:0;border-radius:8px;background:#7c3aed;color:#fff;font-weight:600">CLAIM MP</button>

      <div style="margin-top:24px;border-top:1px solid #333;padding-top:16px">
        <h4 style="margin:0 0 8px">Tukar ke CP</h4>
        <div style="font-size:13px;opacity:.8">Rate: <b>100 MP = 1 CP</b></div>
        <div style="display:flex;gap:8px;margin:8px 0">
          <input id="inp-mp" type="number" value="100" step="100" min="100" style="flex:1;padding:8px;background:#111;border:1px solid #333;border-radius:6px;color:#fff">
          <button id="btn-convert" style="padding:8px 12px;background:#222;border:1px solid #444;border-radius:6px;color:#fff">Tukar</button>
        </div>
        <div id="convert-info" style="font-size:12px;opacity:.6">Cooldown 5 detik</div>
      </div>
    </div>
  `;

  // AMBIL DATA DARI SUPABASE
  let mp = 0, last = Date.now();
  try {
    const r = await fetch(`${API}/mining?action=status&initData=${encodeURIComponent(tg.initData)}`);
    const j = await r.json();
    mp = Number(j.mp_balance) || 0;
    last = new Date(j.last_claim_at).getTime() || Date.now();
  } catch(e){
    document.getElementById('mp-timer').textContent = 'Gagal load API';
    return;
  }

  function tick(){
    const now = Date.now();
    const elapsed = Math.max(0, (now - last)/1000);
    let cur = Math.min(mp + elapsed * PER_SEC, MAX);
    
    document.getElementById('mp-big').textContent = Math.floor(cur).toLocaleString('id-ID') + ' MP';
    document.getElementById('mp-sub').textContent = `${Math.floor(cur).toLocaleString()} / 20.000 (max 1 jam)`;
    document.getElementById('mp-bar').style.width = (cur/MAX*100)+'%';
    
    const remain = MAX - cur;
    if(remain <= 0.1){
      document.getElementById('mp-timer').textContent = 'PENUH! Claim sekarang';
      document.getElementById('btn-claim').disabled = false;
    } else {
      const s = Math.floor(remain / PER_SEC);
      document.getElementById('mp-timer').textContent = `Penuh dalam ${Math.floor(s/60)}m ${s%60}d`;
    }
  }

  tick();
  timer = setInterval(tick, 1000);

  document.getElementById('btn-claim').onclick = async () => {
    const r = await fetch(`${API}/mining?action=claim`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({initData: tg.initData})
    });
    const j = await r.json();
    if(j.ok) loadMining(); else tg.showAlert('Claim gagal');
  };

  let lastConvert = 0;
  document.getElementById('btn-convert').onclick = async () => {
    if(Date.now() - lastConvert < 5000) return;
    lastConvert = Date.now();
    const val = parseInt(document.getElementById('inp-mp').value);
    const r = await fetch(`${API}/mining?action=convert`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({initData: tg.initData, mp: val})
    });
    const j = await r.json();
    if(j.ok){ tg.showAlert(`Dapat ${j.cp} CP`); loadMining(); }
    else tg.showAlert(j.error || 'Gagal');
  };
}
