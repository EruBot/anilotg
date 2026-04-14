import { useEffect, useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = "harian" | "mingguan";
type View = "board" | "profile";

interface Row {
  rank: number;
  user_id: string;
  display_name: string;
  username: string | null;
  value: number;
  unit: string;
  avatar_seed: string;
}

interface Profile {
  user_id: string;
  first_name: string;
  username: string | null;
  chat_id: string;
  chat_mingguan: number;
  cp_mingguan: number;
  total_chat: number;
  total_cp: number;
  custom_title: string | null;
  last_chat_mingguan: string | null;
  highest_rank: string | null;
  highest_rank_value: number | null;
  current_rank: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = "https://anilocp.vercel.app/api/miniapp/leaderboard";
const PROFILE_API = "https://anilocp.vercel.app/api/miniapp/profile";
const FIXED_CHAT = "-1001236366475";
const GROUP_NAME = "Anime Lovers Indo";

const PERIODS: { key: Period; label: string }[] = [
  { key: "harian", label: "Harian" },
  { key: "mingguan", label: "Mingguan" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTG(): any {
  return (window as any)?.Telegram?.WebApp?? null;
}

function decodeStartParam(raw: string): string | null {
  if (!raw) return null;
  if (/^c\d+$/.test(raw)) return `-${raw.slice(1)}`;
  if (/^-?\d+$/.test(raw)) return raw;
  try {
    const p = new URLSearchParams(raw);
    const v = p.get("chat_id");
    if (v) return v;
  } catch {}
  return null;
}

function resolveChatId(): string {
  const tg = getTG();
  if (tg) {
    const decoded = decodeStartParam(tg.initDataUnsafe?.start_param || "");
    if (decoded) return decoded;
  }
  const url = new URLSearchParams(window.location.search).get("chat_id");
  if (url) return url;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("chat_id");
  if (hash) return hash;
  return FIXED_CHAT;
}

function avatar(seed: string): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0a1a,111827,1e293b`;
}

function fmt(n: number): string {
  return n.toLocaleString("id-ID");
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MiniApp() {
  const tg = useMemo(() => getTG(), []);
  const [chatId] = useState<string>(() => resolveChatId());
  const [view, setView] = useState<View>("board");

  // Board state
  const [period, setPeriod] = useState<Period>("mingguan");
  const [rows, setRows] = useState<Row[]>([]);
  const [top, setTop] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileRank, setProfileRank] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!tg) return;
    tg.ready(); tg.expand();
    tg.setHeaderColor?.("#020617");
    tg.setBackgroundColor?.("#020617");
  }, [tg]);

  // Fetch Board (CP only)
  useEffect(() => {
    if (view!== "board") return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError(null);

    // UNTUK 100 USER: ubah DEFAULT_LIMIT di api/miniapp/leaderboard.js jadi 100
    const url = `${API_BASE}?chat_id=${encodeURIComponent(chatId)}&type=cp&period=${period}`;

    fetch(url, { signal: ctrl.signal, headers: { "X-Telegram-Init-Data": tg?.initData || "" } })
     .then(r => r.json())
     .then(json => {
        if (ctrl.signal.aborted) return;
        if (!json.ok) { setError(json.error || "Gagal memuat"); setRows([]); setTop([]); return; }
        setRows(json.rows || []);
        setTop(json.top_three || []);
      })
     .catch(e => { if (e.name!== "AbortError") setError("Koneksi gagal"); })
     .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });

    return () => ctrl.abort();
  }, [chatId, period, view, tg]);

  // Fetch Profile
  useEffect(() => {
    if (view!== "profile" ||!tg) return;
    setProfileLoading(true);
    fetch(`${PROFILE_API}?chat_id=${encodeURIComponent(chatId)}`, {
      headers: { "X-Telegram-Init-Data": tg.initData || "" }
    })
     .then(r => r.json())
     .then(async json => {
        if (!json.ok) return;
        setProfile(json.user);
        // Ambil ranking CP mingguan
        const lb = await fetch(`${API_BASE}?chat_id=${chatId}&type=cp&period=mingguan`).then(r=>r.json());
        const me = lb.rows?.find((x:Row)=> String(x.user_id) === String(json.user.user_id));
        setProfileRank(me?.rank || null);
      })
     .finally(() => setProfileLoading(false));
  }, [view, chatId, tg]);

  const rest = rows.slice(3);
  const user = tg?.initDataUnsafe?.user;

  return (
    <div style={styles.root}>
      <div style={styles.bgGlow} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <span style={styles.headerTitle}>
            {view === "board"? "Leaderboard Chat Point" : "Profile"}
          </span>
          <span style={styles.headerSub}>
            {view === "board"? `Grup: ${GROUP_NAME}` : `@${user?.username || user?.id}`}
          </span>
        </div>

        {view === "board" && (
          <div style={styles.tabRow}>
            {PERIODS.map(p => (
              <button key={p.key} style={{...styles.periodTab,...(period===p.key?styles.periodTabActive:{})}} onClick={()=>setPeriod(p.key)}>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {view === "board" && (
          <>
            {loading && <div style={styles.skeletonWrap}>{[...Array(5)].map((_,i)=><div key={i} style={{...styles.skeleton, opacity:1-i*0.15}} />)}</div>}
            {!loading && error && <div style={styles.errorBox}>⚠️<div style={{marginTop:8,opacity:.7}}>{error}</div></div>}
            {!loading &&!error && top.length>0 && (
              <div style={styles.podium}>
                {[1,0,2].map(i=>{ const u=top[i]; if(!u) return <div key={i} style={{flex:1}}/>;
                  const colors=["#F59E0B","#9CA3AF","#CD7F32"];
                  return (
                  <div key={u.user_id} style={styles.podiumCard}>
                    <div style={{...styles.medalBadge, background:colors[i]}}>{["🥇","🥈","🥉"][i]}</div>
                    <img src={avatar(u.avatar_seed)} style={{...styles.avatarImg, width:i===0?64:52, height:i===0?64:52}} alt="" />
                    <div style={styles.podiumName}>{u.display_name}</div>
                    <div style={{...styles.podiumValue, color:colors[i]}}>{fmt(u.value)} <span style={styles.unit}>CP</span></div>
                  </div>
                )})}
              </div>
            )}
            {!loading &&!error && (
              <div style={styles.list}>
                {rest.map(u=>(
                  <div key={u.user_id} style={styles.listRow}>
                    <div style={styles.rankNum}>#{u.rank}</div>
                    <img src={avatar(u.avatar_seed)} style={styles.listAvatar} alt="" />
                    <div style={{flex:1,minWidth:0}}>
                      {/* PAKAI first_name DIATAS @username */}
                      <div style={styles.listName}>{u.display_name}</div>
                      {u.username && <div style={styles.listUsername}>@{u.username}</div>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={styles.listValue}>{fmt(u.value)}</div>
                      <div style={styles.unit}>CP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "profile" && (
          <>
            {profileLoading && <div style={styles.skeletonWrap}>{[...Array(3)].map((_,i)=><div key={i} style={styles.skeleton} />)}</div>}
            {profile && (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {/* Profile Card Profesional */}
                <div style={styles.profileCard}>
                  <div style={styles.profileTop}>
                    <img src={avatar(profile.username || profile.first_name)} style={styles.profileAvatar} alt="" />
                    <div>
                      <div style={styles.profileName}>{profile.first_name}</div>
                      <div style={styles.profileUsername}>@{profile.username || profile.user_id}</div>
                    </div>
                  </div>
                  {profile.custom_title && <div style={styles.titleBadge}>🏷️ {profile.custom_title}</div>}
                </div>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                  <div style={styles.statBox}><div style={styles.statLabel}>🏆 Rank</div><div style={styles.statValue}>{profile.current_rank}</div></div>
                  <div style={styles.statBox}><div style={styles.statLabel}>🏅 Highest</div><div style={styles.statValue}>{profile.highest_rank || "-"}</div></div>
                  <div style={styles.statBox}><div style={styles.statLabel}>📊 CP Minggu</div><div style={styles.statValue}>{fmt(profile.cp_mingguan)}</div></div>
                  <div style={styles.statBox}><div style={styles.statLabel}>💬 Chat Minggu</div><div style={styles.statValue}>{fmt(profile.chat_mingguan)}</div></div>
                  <div style={styles.statBox}><div style={styles.statLabel}>💬 Total Chat</div><div style={styles.statValue}>{fmt(profile.total_chat)}</div></div>
                  <div style={styles.statBox}><div style={styles.statLabel}>📍 Rank CP</div><div style={styles.statValue}>{profileRank? `#${profileRank}` : "-"}</div></div>
                </div>

                {/* Lifetime */}
                <div style={styles.lifetimeCard}>
                  <div style={styles.lifetimeLabel}>⚡ Total CP (Lifetime)</div>
                  <div style={styles.lifetimeValue}>{fmt(profile.total_cp)}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={styles.bottomNav}>
        <button style={{...styles.navBtn,...(view==="board"?styles.navActive:{})}} onClick={()=>setView("board")}>📊 Board</button>
        <button style={{...styles.navBtn,...(view==="profile"?styles.navActive:{})}} onClick={()=>setView("profile")}>👤 Profile</button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root:{minHeight:"100vh",background:"#020617",color:"#f1f5f9",fontFamily:"'DM Sans',system-ui",position:"relative",paddingBottom:70},
  bgGlow:{position:"fixed",top:-200,left:"50%",transform:"translateX(-50%)",width:600,height:400,borderRadius:"50%",background:"radial-gradient(ellipse,#1e3a5f44 0%,transparent 70%)",pointerEvents:"none"},
  header:{position:"sticky",top:0,zIndex:10,background:"linear-gradient(180deg,#020617 80%,#02061700)",padding:"16px 16px 8px"},
  headerInner:{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12},
  headerTitle:{fontSize:18,fontWeight:700},
  headerSub:{fontSize:12,opacity:.5,textTransform:"uppercase",letterSpacing:".08em"},
  tabRow:{display:"flex",gap:6},
  periodTab:{flex:1,padding:"8px 0",borderRadius:10,border:"1px solid #ffffff14",background:"transparent",color:"#64748b",fontSize:13,fontWeight:600,cursor:"pointer"},
  periodTabActive:{background:"linear-gradient(135deg,#1e40af,#0369a1)",color:"#fff",border:"1px solid #3b82f680"},
  content:{padding:"4px 16px 32px",position:"relative",zIndex:1},
  skeletonWrap:{display:"flex",flexDirection:"column",gap:8,marginTop:8},
  skeleton:{height:58,borderRadius:14,background:"linear-gradient(90deg,#0f172a,#1e293b,#0f172a)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"},
  errorBox:{textAlign:"center",padding:"60px 20px",color:"#94a3b8"},
  podium:{display:"flex",gap:8,marginBottom:16,alignItems:"flex-end"},
  podiumCard:{flex:1,background:"linear-gradient(160deg,#0f172a,#1e293b)",border:"1px solid #ffffff10",borderRadius:16,padding:"12px 8px",textAlign:"center"},
  medalBadge:{display:"inline-flex",padding:"2px 8px",borderRadius:20,fontSize:14,marginBottom:8,fontWeight:700,color:"#000"},
  avatarImg:{borderRadius:12,objectFit:"cover",background:"#0f172a",border:"2px solid #ffffff20"},
  podiumName:{fontSize:11,fontWeight:600,margin:"6px 0 2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
  podiumValue:{fontSize:13,fontWeight:700},
  list:{display:"flex",flexDirection:"column",gap:6},
  listRow:{display:"flex",alignItems:"center",gap:10,background:"linear-gradient(135deg,#0f172a,#1a2540)",border:"1px solid #ffffff0a",borderRadius:14,padding:"10px 12px"},
  rankNum:{width:28,fontSize:12,fontWeight:700,color:"#475569",textAlign:"center"},
  listAvatar:{width:38,height:38,borderRadius:10,flexShrink:0},
  listName:{fontSize:13,fontWeight:600,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
  listUsername:{fontSize:11,color:"#475569"},
  listValue:{fontSize:14,fontWeight:700,color:"#7dd3fc"},
  unit:{fontSize:10,color:"#475569",textTransform:"uppercase"},
  // Profile
  profileCard:{background:"linear-gradient(160deg,#0f172a,#1e293b)",border:"1px solid #ffffff12",borderRadius:18,padding:16},
  profileTop:{display:"flex",alignItems:"center",gap:12},
  profileAvatar:{width:56,height:56,borderRadius:14,border:"2px solid #3b82f640"},
  profileName:{fontSize:18,fontWeight:700},
  profileUsername:{fontSize:13,color:"#64748b",marginTop:2},
  titleBadge:{marginTop:10,display:"inline-block",padding:"4px 10px",borderRadius:8,background:"#ffffff10",fontSize:12,color:"#93c5fd"},
  statsGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},
  statBox:{background:"#0f172a",border:"1px solid #ffffff0a",borderRadius:14,padding:12},
  statLabel:{fontSize:11,color:"#64748b",marginBottom:4},
  statValue:{fontSize:16,fontWeight:700,color:"#e2e8f0"},
  lifetimeCard:{background:"linear-gradient(135deg,#1e3a8a,#0c4a6e)",borderRadius:16,padding:16,textAlign:"center",border:"1px solid #38bdf840"},
  lifetimeLabel:{fontSize:12,opacity:.8,marginBottom:4},
  lifetimeValue:{fontSize:24,fontWeight:800,color:"#7dd3fc"},
  bottomNav:{position:"fixed",bottom:0,left:0,right:0,display:"flex",background:"#020617e6",backdropFilter:"blur(12px)",borderTop:"1px solid #ffffff10",padding:"8px",gap:8,zIndex:20},
  navBtn:{flex:1,padding:"10px 0",borderRadius:12,border:"1px solid #ffffff10",background:"transparent",color:"#64748b",fontWeight:600,cursor:"pointer"},
  navActive:{background:"#1e40af",color:"#fff",border:"1px solid #3b82f6"},
};
