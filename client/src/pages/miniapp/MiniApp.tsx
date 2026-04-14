import { useEffect, useRef, useState } from "react";

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
  return (window as any)?.Telegram?.WebApp ?? null;
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
  const [tg, setTg] = useState<any>(null);
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
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const app = getTG();
    if (!app) return;

    setTg(app);
    app.ready();
    app.expand();
    app.setHeaderColor?.("#020617");
    app.setBackgroundColor?.("#020617");
  }, []);

  // Fetch Board CP only
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
    setProfileError(null);

    const user = tg.initDataUnsafe?.user;
    if (!user) {
      setProfileError("Buka dari Telegram Mini App");
      setProfileLoading(false);
      return;
    }

    fetch(`${PROFILE_API}?chat_id=${encodeURIComponent(chatId)}`, {
      headers: { "X-Telegram-Init-Data": tg.initData || "" }
    })
     .then(async r => {
        const json = await r.json();
        if (!r.ok ||!json.ok) throw new Error(json.error || "Data belum ada di database");
        return json;
      })
     .then(async json => {
        setProfile(json.user);
        const lb = await fetch(`${API_BASE}?chat_id=${chatId}&type=cp&period=mingguan`).then(r=>r.json());
        const me = lb.rows?.find((x:Row)=> String(x.user_id) === String(user.id));
        setProfileRank(me?.rank || null);
      })
     .catch(e => {
        setProfileError(e.message);
        // fallback biar tidak blank
        setProfile({
          user_id: String(user.id),
          first_name: user.first_name,
          username: user.username || null,
          chat_id: chatId,
          chat_mingguan: 0, cp_mingguan: 0, total_chat: 0, total_cp: 0,
          custom_title: null, last_chat_mingguan: null,
          highest_rank: null, highest_rank_value: null,
          current_rank: "Warrior"
        });
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
            {view === "board"? `Grup: ${GROUP_NAME}` : `@${user?.username || user?.first_name || ''}`}
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
            {loading && <div style={styles.skeletonWrap}>{[...Array(6)].map((_,i)=><div key={i} style={{...styles.skeleton, opacity:1-i*0.12}} />)}</div>}
            {!loading && error && <div style={styles.errorBox}>⚠️<div style={{marginTop:8,opacity:.7}}>{error}</div></div>}
            {!loading &&!error && top.length>0 && (
              <div style={styles.podium}>
                {[1,0,2].map(i=>{ const u=top[i]; if(!u) return <div key={i} style={{flex:1}}/>;
                  const colors=["#F59E0B","#9CA3AF","#CD7F32"];
                  return (
                  <div key={u.user_id} style={styles.podiumCard}>
                    <div style={{...styles.medalBadge, background:colors[i]}}>{["🥇","🥈","🥉"][i]}</div>
                    <img src={avatar(u.avatar_seed)} style={{...styles.avatarImg, width:i===0?68:54, height:i===0?68:54}} alt="" />
                    <div style={styles.podiumName}>{u.display_name}</div>
                    <div style={{...styles.podiumValue, color:colors[i]}}>{fmt(u.value)}</div>
                    <div style={styles.unit}>CP</div>
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
            {profileLoading && <div style={styles.skeletonWrap}>{[...Array(4)].map((_,i)=><div key={i} style={styles.skeleton} />)}</div>}

            {profile && (
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {profileError && (
                  <div style={styles.notice}>
                    {profileError}. Chat dulu di grup agar data tersimpan.
                  </div>
                )}

                {/* HERO PROFILE */}
                <div style={styles.profileHero}>
                  <div style={styles.heroGlow} />
                  <img src={avatar(profile.username || profile.first_name)} style={styles.heroAvatar} alt="" />
                  <div style={styles.heroName}>{profile.first_name}</div>
                  <div style={styles.heroHandle}>@{profile.username || profile.user_id}</div>
                  {profile.custom_title && <div style={styles.heroTitle}>{profile.custom_title}</div>}
                </div>

                {/* STATS GRID */}
                <div style={styles.grid}>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>🏆 Rank Saat Ini</div>
                    <div style={styles.statValue}>{profile.current_rank}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>🏅 Highest Rank</div>
                    <div style={styles.statValue}>{profile.highest_rank || '-'}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>📊 CP Minggu Ini</div>
                    <div style={styles.statValue}>{fmt(profile.cp_mingguan)}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>💬 Chat Minggu Ini</div>
                    <div style={styles.statValue}>{fmt(profile.chat_mingguan)}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>💬 Total Chat</div>
                    <div style={styles.statValue}>{fmt(profile.total_chat)}</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>📍 Ranking CP</div>
                    <div style={styles.statValue}>{profileRank? `#${profileRank}` : '-'}</div>
                  </div>
                </div>

                {/* LIFETIME */}
                <div style={styles.lifetime}>
                  <div style={styles.lifetimeLabel}>⚡ Total CP (Lifetime)</div>
                  <div style={styles.lifetimeNum}>{fmt(profile.total_cp)}</div>
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
  root:{minHeight:"100vh",background:"#020617",color:"#f1f5f9",fontFamily:"'Inter','DM Sans',system-ui",position:"relative",paddingBottom:80},
  bgGlow:{position:"fixed",top:-180,left:"50%",transform:"translateX(-50%)",width:700,height:420,borderRadius:"50%",background:"radial-gradient(ellipse,#0ea5e944 0%,transparent 70%)",pointerEvents:"none",filter:"blur(20px)"},
  header:{position:"sticky",top:0,zIndex:10,background:"linear-gradient(180deg,#020617 85%,#02061700)",padding:"18px 16px 10px",backdropFilter:"blur(8px)"},
  headerInner:{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12},
  headerTitle:{fontSize:20,fontWeight:800,letterSpacing:-0.3},
  headerSub:{fontSize:11,opacity:.55,textTransform:"uppercase",letterSpacing:".1em"},
  tabRow:{display:"flex",gap:8},
  periodTab:{flex:1,padding:"10px 0",borderRadius:12,border:"1px solid #ffffff14",background:"#0f172a80",color:"#94a3b8",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all.2s"},
  periodTabActive:{background:"linear-gradient(135deg,#2563eb,#0ea5e9)",color:"#fff",border:"1px solid #38bdf880",boxShadow:"0 4px 16px #0ea5e930"},
  content:{padding:"8px 16px 32px",position:"relative",zIndex:1},
  skeletonWrap:{display:"flex",flexDirection:"column",gap:10,marginTop:8},
  skeleton:{height:64,borderRadius:16,background:"linear-gradient(90deg,#0f172a,#1e293b,#0f172a)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"},
  errorBox:{textAlign:"center",padding:"60px 20px",color:"#94a3b8"},
  notice:{background:"#f59e0b15",border:"1px solid #f59e0b40",color:"#fcd34d",padding:"10px 12px",borderRadius:12,fontSize:12,textAlign:"center"},
  podium:{display:"flex",gap:10,marginBottom:20,alignItems:"flex-end"},
  podiumCard:{flex:1,background:"linear-gradient(165deg,#0f172a,#111e36)",border:"1px solid #ffffff12",borderRadius:20,padding:"14px 8px",textAlign:"center",position:"relative",boxShadow:"0 8px 24px #00000040"},
  medalBadge:{display:"inline-flex",padding:"3px 10px",borderRadius:20,fontSize:13,marginBottom:8,fontWeight:800,color:"#000"},
  avatarImg:{borderRadius:16,objectFit:"cover",background:"#0f172a",border:"2px solid #ffffff18"},
  podiumName:{fontSize:12,fontWeight:700,margin:"8px 0 2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
  podiumValue:{fontSize:15,fontWeight:800},
  list:{display:"flex",flexDirection:"column",gap:8},
  listRow:{display:"flex",alignItems:"center",gap:12,background:"linear-gradient(135deg,#0f172aee,#16233e)",border:"1px solid #ffffff0a",borderRadius:16,padding:"12px 14px",transition:"transform.15s",cursor:"pointer"},
  rankNum:{width:32,fontSize:13,fontWeight:800,color:"#475569",textAlign:"center"},
  listAvatar:{width:42,height:42,borderRadius:12,flexShrink:0,border:"1px solid #ffffff12"},
  listName:{fontSize:14,fontWeight:700,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
  listUsername:{fontSize:11,color:"#64748b",marginTop:1},
  listValue:{fontSize:15,fontWeight:800,color:"#7dd3fc"},
  unit:{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:".05em"},
  // Profile
  profileHero:{position:"relative",background:"linear-gradient(160deg,#0f172a,#0b1225)",border:"1px solid #ffffff14",borderRadius:24,padding:"28px 20px 22px",textAlign:"center",overflow:"hidden"},
  heroGlow:{position:"absolute",top:-60,left:"50%",transform:"translateX(-50%)",width:200,height:200,background:"radial-gradient(circle,#38bdf840,transparent 70%)",filter:"blur(10px)"},
  heroAvatar:{width:84,height:84,borderRadius:22,border:"3px solid #38bdf850",marginBottom:12,position:"relative",zIndex:1,background:"#020617"},
  heroName:{fontSize:24,fontWeight:900,letterSpacing:-0.5,position:"relative",zIndex:1},
  heroHandle:{fontSize:13,color:"#64748b",marginTop:4,position:"relative",zIndex:1},
  heroTitle:{display:"inline-block",marginTop:10,padding:"6px 14px",background:"#38bdf81a",border:"1px solid #38bdf840",color:"#7dd3fc",borderRadius:10,fontSize:12,fontWeight:700,position:"relative",zIndex:1},
  grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  statCard:{background:"#0f172acc",border:"1px solid #ffffff0f",borderRadius:16,padding:14,backdropFilter:"blur(6px)"},
  statLabel:{fontSize:11,color:"#94a3b8",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em"},
  statValue:{fontSize:18,fontWeight:800,color:"#f1f5f9"},
  lifetime:{background:"linear-gradient(135deg,#1e40af,#0369a1)",borderRadius:20,padding:20,textAlign:"center",border:"1px solid #38bdf850",boxShadow:"0 10px 30px #0ea5e930"},
  lifetimeLabel:{fontSize:12,opacity:.9,marginBottom:6,letterSpacing:".05em",textTransform:"uppercase"},
  lifetimeNum:{fontSize:32,fontWeight:900,color:"#e0f2fe",letterSpacing:-0.5},
  bottomNav:{position:"fixed",bottom:0,left:0,right:0,display:"flex",background:"#020617f0",backdropFilter:"blur(14px)",borderTop:"1px solid #ffffff12",padding:"10px 12px",gap:10,zIndex:20},
  navBtn:{flex:1,padding:"12px 0",borderRadius:14,border:"1px solid #ffffff12",background:"#0f172a",color:"#94a3b8",fontWeight:700,cursor:"pointer",fontSize:14,transition:"all.2s"},
  navActive:{background:"linear-gradient(135deg,#2563eb,#0ea5e9)",color:"#fff",border:"1px solid #38bdf8",boxShadow:"0 4px 14px #0ea5e940"},
};
