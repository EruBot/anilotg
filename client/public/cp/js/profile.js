export async function loadProfile() {
  title.textContent = 'Profile';
  const u = tg.initDataUnsafe?.user || {};
  subtitle.textContent = `@${u.username || u.first_name || ''}`;
  boardControls.style.display = 'none';
  content.innerHTML = '<div class="loading">memuat data...</div>';

  const r = await fetch(`${API}/profile?chat_id=${CHAT_ID}&user_id=${u.id}`, {
    headers:{'X-Telegram-Init-Data': tg.initData || ''}
  });
  const { user:p } = await r.json();

  content.innerHTML = `
    <div class="card hero">
      <div class="avatar"><img src="https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(p.username||p.first_name)}&backgroundColor=0b1020" alt=""></div>
      <h3>${p.first_name}</h3>
      <div class="meta">@${p.username || '-'} • ID ${p.user_id}</div>
    </div>

    <div class="grid">
      <div class="stat"><div class="label">🏆 Rank</div><div class="value">${p.current_rank}</div></div>
      <div class="stat"><div class="label">📊 CP Minggu</div><div class="value">${Number(p.cp_mingguan).toLocaleString('id-ID')}</div></div>
      <div class="stat"><div class="label">💬 Chat Minggu</div><div class="value">${Number(p.chat_mingguan).toLocaleString('id-ID')}</div></div>
      <div class="stat"><div class="label">💬 Total Chat</div><div class="value">${Number(p.total_chat).toLocaleString('id-ID')}</div></div>
    </div>

    <div class="big">
      <div class="t">⚡ TOTAL CP</div>
      <div class="v">${Number(p.total_cp).toLocaleString('id-ID')}</div>
    </div>
  `;
}
