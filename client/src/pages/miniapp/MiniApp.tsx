import { useEffect, useMemo, useRef, useState } from "react";

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

const API_BASE = "https://anilocp.vercel.app/api/miniapp/leaderboard";
const PROFILE_API = "https://anilocp.vercel.app/api/miniapp/profile";
const FIXED_CHAT = "-1001236366475";
const GROUP_NAME = "Anime Lovers Indo";

const PERIODS = [
  { key: "harian", label: "Harian" },
  { key: "mingguan", label: "Mingguan" },
] as const;

function getTG(): any { return (window as any)?.Telegram?.WebApp?? null; }
function decodeStartParam(raw: string) {
  if (!raw) return null;
  if (/^c\d+$/.test(raw)) return `-${raw.slice(1)}`;
  if (/^-?\d+$/.test(raw)) return raw;
  try { const p = new URLSearchParams(raw); return p.get("chat_id"); } catch { return null; }
}
function resolveChatId() {
  const tg = getTG();
  if (tg) { const d = decodeStartParam(tg.initDataUnsafe?.start_param || ""); if (d) return d; }
  const url = new URLSearchParams(window.location.search).get("chat_id");
  if (url) return url;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("chat_id");
  if (hash) return hash;
  return FIXED_CHAT;
}
function avatar(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0a1a,111827,1e293b`;
}
function fmt(n: number) { return n.toLocaleString("id-ID"); }

export default function MiniApp() {
  const tg = useMemo(() => getTG(), []);
  const [chatId] = useState(() => resolveChatId());
  const [view, setView] = useState<View>("board");

  const [period, setPeriod] = useState<Period>("mingguan");
  const [rows, setRows] = useState<Row[]>([]);
  const [top, setTop] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileRank, setProfileRank] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!tg) return;
    tg.ready(); tg.expand();
    tg.setHeaderColor?.("#020617");
    tg.setBackgroundColor?.("#020617");
  }, [tg]);

  // BOARD
  useEffect(() => {
    if (view!== "board") return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError(null);

    fetch(`${API_BASE}?chat_id=${chatId}&type=cp&period=${period}`, {
      signal: ctrl.signal,
      headers: { "X-Telegram-Init-Data": tg?.initData || "" }
    })
     .then(r => r.json())
     .then(j => { if (j.ok) { setRows(j.rows || []); setTop(j.top_three || []); } else { setError(j.error); } })
     .catch(e => { if (e.name!== "AbortError") setError("Koneksi gagal"); })
     .finally(() => setLoading(false));
  }, [chatId, period, view, tg]);

  // PROFILE - VERSI ANTI BLANK
  useEffect(() => {
    if (view!== "profile") return;
    setProfileLoading(true);
    setProfileError(null);

    const tgUser = tg?.initDataUnsafe?.user;
    const initData = tg?.initData || "";

    // Jika tidak dibuka dari Telegram, tetap tampilkan fallback
    if (!tg ||!tgUser ||!initData) {
      setProfileError("Buka lewat tombol Mini App di Telegram. InitData tidak terdeteksi.");
      setProfile({
        user_id: "0",
        first_name: tgUser?.first_name || "Guest",
        username: tgUser?.username || null,
        chat_id: chatId,
        chat_mingguan: 0, cp_mingguan: 0, total_chat: 0, total_cp: 0,
        custom_title: null, last_chat_mingguan: null,
        highest_rank: null, highest_rank_value: null,
        current_rank: "Warrior"
      });
      setProfileLoading(false);
      return;
    }

    fetch(`${PROFILE_API}?chat_id=${encodeURIComponent(chatId)}`, {
      headers: { "X-Telegram-Init-Data": initData }
    })
     .then(async r => {
        const txt = await r.text();
        let json: any;
        try { json = JSON.parse(txt); } catch { throw new Error("API tidak return JSON"); }
        if (!r.ok ||!json.ok) throw new Error(json.error || `Error ${r.status}`);
        return json;
      })
     .then(async json => {
        setProfile(json.user);
        const lb = await fetch(`${API_BASE}?chat_id=${chatId}&type=cp&period=mingguan`).then(r => r.json());
        const me = lb.rows?.find((x: Row) => String(x.user_id) === String(tgUser.id));
        setProfileRank(me?.rank || null);
      })
     .catch(e => {
        setProfileError(e.message);
        // fallback biar tidak blank
        setProfile({
          user_id: String(tgUser.id),
          first_name: tgUser.first_name,
          username: tgUser.username || null,
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
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <span style={styles.headerTitle}>{view === "board"? "Leaderboard Chat Point" : "Profile"}</span>
          <span style={styles.headerSub}>{view === "board"? `Grup: ${GROUP_NAME}` : `@${user?.username || user?.first_name || "guest"}`}</span>
        </div>
        {view === "board" && (
          <div style={styles.tabRow}>
            {PERIODS.map(p => (
              <button key={p.key} style={{...styles.periodTab,...(period === p.key? styles.periodTabActive : {}) }} onClick={() => setPeriod(p.key)}>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.content}>
        {view === "board" && (
          <>
            {loading && <div style={styles.skeletonWrap}>{[...Array(6)].map((_, i) => <div key={i} style={{...styles.skeleton, opacity: 1 - i * 0.12 }} />)}</div>}
            {!loading && error && <div style={styles.errorBox}>⚠️<div style={{ marginTop: 8 }}>{error}</div></div>}
            {!loading &&!error && top.length > 0 && (
              <div style={styles.podium}>
                {[1, 0, 2].map(i => {
                  const u = top[i]; if (!u) return <div key={i} style={{ flex: 1 }} />;
                  const colors = ["#F59E0B", "#9CA3AF", "#CD7F32"];
                  return (
                    <div key={u.user_id} style={styles.podiumCard}>
                      <div style={{...styles.medalBadge, background: colors[i] }}>{["🥇", "🥈", "🥉"][i]}</div>
                      <img src={avatar(u.avatar_seed)} style={{...styles.avatarImg, width: i === 0? 68 : 54, height: i === 0? 68 : 54 }} alt="" />
                      <div style={styles.podiumName}>{u.display_name}</div>
                      <div style={{...styles.podiumValue, color: colors[i] }}>{fmt(u.value)}</div>
                    </div>
                  );
                })}
              </div>
            )}
            {!loading &&!error && (
              <div style={styles.list}>
                {rest.map(u => (
                  <div key={u.user_id} style={styles.listRow}>
                    <div style={styles.rankNum}>#{u.rank}</div>
                    <img src={avatar(u.avatar_seed)} style={styles.listAvatar} alt="" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.listName}>{u.display_name}</div>
                      {u.username && <div style={styles.listUsername}>@{u.username}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
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
            {profileLoading && <div style={styles.skeletonWrap}>{[...Array(4)].map((_, i) => <div key={i} style={styles.skeleton} />)}</div>}
            {profileError && <div style={styles.notice}>{profileError}</div>}
            {profile && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={styles.profileHero}>
                  <div style={styles.heroGlow} />
                  <img src={avatar(profile.username || profile.first_name)} style={styles.heroAvatar} alt="" />
                  <div style={styles.heroName}>{profile.first_name}</div>
                  <div style={styles.heroHandle}>@{profile.username || profile.user_id}</div>
                  {profile.custom_title && <div style={styles.heroTitle}>{profile.custom_title}</div>}
                </div>

                <div style={styles.grid}>
                  <div style={styles.statCard}><div style={styles.statLabel}>🏆 Rank</div><div style={styles.statValue}>{profile.current_rank}</div></div>
                  <div style={styles.statCard}><div style={styles.statLabel}>🏅 Highest</div><div style={styles.statValue}>{profile.highest_rank || "-"}</div></div>
                  <div style={styles.statCard}><div style={styles.statLabel}>📊 CP Minggu</div><div style={styles.statValue}>{fmt(profile.cp_mingguan)}</div></div>
                  <div style={styles.statCard}><div style={styles.statLabel}>💬 Chat Minggu</div><div style={styles.statValue}>{fmt(profile.chat_mingguan)}</div></div>
                  <div style={styles.statCard}><div style={styles.statLabel}>💬 Total Chat</div><div style={styles.statValue}>{fmt(profile.total_chat)}</div></div>
                  <div style={styles.statCard}><div style={styles.statLabel}>📍 Rank CP</div><div style={styles.statValue}>{profileRank? `#${profileRank}` : "-"}</div></div>
                </div>

                <div style={styles.lifetime}>
                  <div style={styles.lifetimeLabel}>⚡ Total CP (Lifetime)</div>
                  <div style={styles.lifetimeNum}>{fmt(profile.total_cp)}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={styles.bottomNav}>
        <button style={{...styles.navBtn,...(view === "board"? styles.navActive : {}) }} onClick={() => setView("board")}>📊 Board</button>
        <button style={{...styles.navBtn,...(view === "profile"? styles.navActive : {}) }} onClick={() => setView("profile")}>👤 Profile</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: "100vh", background: "#020617", color: "#f1f5f9", fontFamily: "Inter, system-ui", paddingBottom: 80, position: "relative" },
  bgGlow: { position: "fixed", top: -180, left: "50%", transform: "translateX(-50%)", width: 700, height: 420, borderRadius: "50%", background: "radial-gradient(ellipse,#0ea5e944 0%,transparent 70%)", filter: "blur(20px)" },
  header: { position: "sticky", top: 0, zIndex: 10, background: "linear-gradient(180deg,#020617 85%,#02061700)", padding: "18px 16px 10px", backdropFilter: "blur(8px)" },
  headerInner: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: 800 },
  headerSub: { fontSize: 11, opacity:.55, textTransform: "uppercase", letterSpacing: ".1em" },
  tabRow: { display: "flex", gap: 8 },
  periodTab: { flex: 1, padding: "10px 0", borderRadius: 12, border: "1px solid #ffffff14", background: "#0f172a80", color: "#94a3b8", fontWeight: 700, cursor: "pointer" },
  periodTabActive: { background: "linear-gradient(135deg,#2563eb,#0ea5e9)", color: "#fff", border: "1px solid #38bdf880" },
  content: { padding: "8px 16px 32px", position: "relative", zIndex: 1 },
  skeletonWrap: { display: "flex", flexDirection: "column", gap: 10 },
  skeleton: { height: 64, borderRadius: 16, background: "linear-gradient(90deg,#0f172a,#1e293b,#0f172a)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  errorBox: { textAlign: "center", padding: "60px 20px", color: "#94a3b8" },
  notice: { background: "#f59e0b15", border: "1px solid #f59e0b40", color: "#fcd34d", padding: "10px 12px", borderRadius: 12, fontSize: 12, textAlign: "center", marginBottom: 12 },
  podium: { display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" },
  podiumCard: { flex: 1, background: "linear-gradient(165deg,#0f172a,#111e36)", border: "1px solid #ffffff12", borderRadius: 20, padding: "14px 8px", textAlign: "center" },
  medalBadge: { display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 13, marginBottom: 8, fontWeight: 800, color: "#000" },
  avatarImg: { borderRadius: 16, objectFit: "cover", border: "2px solid #ffffff18" },
  podiumName: { fontSize: 12, fontWeight: 700, margin: "8px 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  podiumValue: { fontSize: 15, fontWeight: 800 },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  listRow: { display: "flex", alignItems: "center", gap: 12, background: "#0f172aee", border: "1px solid #ffffff0a", borderRadius: 16, padding: "12px 14px" },
  rankNum: { width: 32, fontSize: 13, fontWeight: 800, color: "#475569", textAlign: "center" },
  listAvatar: { width: 42, height: 42, borderRadius: 12, border: "1px solid #ffffff12" },
  listName: { fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  listUsername: { fontSize: 11, color: "#64748b" },
  listValue: { fontSize: 15, fontWeight: 800, color: "#7dd3fc" },
  unit: { fontSize: 10, color: "#475569", textTransform: "uppercase" },
  profileHero: { position: "relative", background: "linear-gradient(160deg,#0f172a,#0b1225)", border: "1px solid #ffffff14", borderRadius: 24, padding: "28px 20px 22px", textAlign: "center", overflow: "hidden" },
  heroGlow: { position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, background: "radial-gradient(circle,#38bdf840,transparent 70%)", filter: "blur(10px)" },
  heroAvatar: { width: 84, height: 84, borderRadius: 22, border: "3px solid #38bdf850", marginBottom: 12, position: "relative", zIndex: 1 },
  heroName: { fontSize: 24, fontWeight: 900, position: "relative", zIndex: 1 },
  heroHandle: { fontSize: 13, color: "#64748b", marginTop: 4, position: "relative", zIndex: 1 },
  heroTitle: { display: "inline-block", marginTop: 10, padding: "6px 14px", background: "#38bdf81a", border: "1px solid #38bdf840", color: "#7dd3fc", borderRadius: 10, fontSize: 12, fontWeight: 700, position: "relative", zIndex: 1 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  statCard: { background: "#0f172acc", border: "1px solid #ffffff0f", borderRadius: 16, padding: 14 },
  statLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" },
  statValue: { fontSize: 18, fontWeight: 800 },
  lifetime: { background: "linear-gradient(135deg,#1e40af,#0369a1)", borderRadius: 20, padding: 20, textAlign: "center", border: "1px solid #38bdf850" },
  lifetimeLabel: { fontSize: 12, opacity:.9, marginBottom: 6, textTransform: "uppercase" },
  lifetimeNum: { fontSize: 32, fontWeight: 900, color: "#e0f2fe" },
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", background: "#020617f0", backdropFilter: "blur(14px)", borderTop: "1px solid #ffffff12", padding: "10px 12px", gap: 10, zIndex: 20 },
  navBtn: { flex: 1, padding: "12px 0", borderRadius: 14, border: "1px solid #ffffff12", background: "#0f172a", color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 14 },
  navActive: { background: "linear-gradient(135deg,#2563eb,#0ea5e9)", color: "#fff", border: "1px solid #38bdf8" },
};
