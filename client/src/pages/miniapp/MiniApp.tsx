import { useEffect, useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LBType   = "cp"   | "chat";
type Period   = "harian" | "mingguan" | "lifetime";

interface Row {
  rank:         number;
  user_id:      string;
  display_name: string;
  username:     string | null;
  value:        number;
  unit:         string;
  avatar_seed:  string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE   = "https://anilocp.vercel.app/api/miniapp/leaderboard";
const FIXED_CHAT = "-1001236366475"; // grup utama — override jika tidak ada param

const CP_PERIODS: { key: Period; label: string }[] = [
  { key: "harian",   label: "Harian"   },
  { key: "mingguan", label: "Mingguan" },
  { key: "lifetime", label: "Lifetime" },
];
const CHAT_PERIODS: { key: Period; label: string }[] = [
  { key: "harian",   label: "Harian"   },
  { key: "mingguan", label: "Mingguan" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTG(): any {
  return (window as any)?.Telegram?.WebApp ?? null;
}

/** Decode start_param dari Telegram.
 *  Format yang dikirim miniapp.js: "c1001236366475"  → "-1001236366475"
 *  Format lama (jika ada): langsung chatId angka
 */
function decodeStartParam(raw: string): string | null {
  if (!raw) return null;
  // Format baru: huruf "c" + angka absolut
  if (/^c\d+$/.test(raw)) return `-${raw.slice(1)}`;
  // Format angka langsung (negatif atau positif)
  if (/^-?\d+$/.test(raw)) return raw;
  // Format "chat_id=..." (format lama yang bermasalah — coba parse)
  try {
    const p = new URLSearchParams(raw);
    const v = p.get("chat_id");
    if (v) return v;
  } catch {}
  return null;
}

/** Resolve chatId dari semua sumber yang mungkin, dengan prioritas. */
function resolveChatId(): string {
  const tg = getTG();

  // 1. Telegram initDataUnsafe.start_param
  if (tg) {
    const sp = tg.initDataUnsafe?.start_param;
    const decoded = decodeStartParam(sp || "");
    if (decoded) return decoded;
  }

  // 2. URL query ?chat_id=...
  const urlParams = new URLSearchParams(window.location.search);
  const urlChatId = urlParams.get("chat_id");
  if (urlChatId) return urlChatId;

  // 3. URL hash #chat_id=...
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const hashChatId = hashParams.get("chat_id");
  if (hashChatId) return hashChatId;

  // 4. Fallback ke grup utama
  return FIXED_CHAT;
}

function avatar(seed: string): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0a1a,111827,1e293b`;
}

function fmt(n: number): string {
  return n.toLocaleString("id-ID");
}

// Medal colors
const MEDAL_BG   = ["#F59E0B", "#9CA3AF", "#CD7F32"];
const MEDAL_TEXT = ["#92400E", "#374151", "#78350F"];
const MEDAL_LABEL = ["🥇", "🥈", "🥉"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MiniApp() {
  const tg = useMemo(() => getTG(), []);

  const [chatId]                    = useState<string>(() => resolveChatId());
  const [type,     setType]         = useState<LBType>("cp");
  const [period,   setPeriod]       = useState<Period>("harian");
  const [rows,     setRows]         = useState<Row[]>([]);
  const [top,      setTop]          = useState<Row[]>([]);
  const [loading,  setLoading]      = useState(true);
  const [error,    setError]        = useState<string | null>(null);
  const abortRef                    = useRef<AbortController | null>(null);

  // Telegram WebApp setup
  useEffect(() => {
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.("#020617");
    tg.setBackgroundColor?.("#020617");
  }, [tg]);

  // Sinkron period saat type berubah (lifetime tidak ada di chat)
  useEffect(() => {
    if (type === "chat" && period === "lifetime") {
      setPeriod("harian");
    }
  }, [type]);

  // Fetch leaderboard
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    const url = `${API_BASE}?chat_id=${encodeURIComponent(chatId)}&type=${type}&period=${period}`;

    fetch(url, {
      signal:  ctrl.signal,
      headers: { "X-Telegram-Init-Data": tg?.initData || "" },
    })
      .then(r => r.json())
      .then(json => {
        if (ctrl.signal.aborted) return;
        if (!json.ok) {
          setError(json.error || "Gagal memuat data");
          setRows([]);
          setTop([]);
          return;
        }
        setRows(json.rows     || []);
        setTop(json.top_three || []);
      })
      .catch(e => {
        if (e.name === "AbortError") return;
        setError("Koneksi gagal. Coba lagi.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [chatId, type, period]);

  const periods = type === "cp" ? CP_PERIODS : CHAT_PERIODS;
  const rest    = rows.slice(3);

  return (
    <div style={styles.root}>
      {/* Background grain + glow */}
      <div style={styles.bgGlow} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <span style={styles.headerTitle}>
            {type === "cp" ? "⚡ CP" : "💬 Chat"} Leaderboard
          </span>
          <span style={styles.headerSub}>
            {periods.find(p => p.key === period)?.label}
          </span>
        </div>

        {/* Type tabs */}
        <div style={styles.tabRow}>
          {(["cp", "chat"] as LBType[]).map(t => (
            <button
              key={t}
              style={{ ...styles.tab, ...(type === t ? styles.tabActive : {}) }}
              onClick={() => setType(t)}
            >
              {t === "cp" ? "⚡ CP" : "💬 Chat"}
            </button>
          ))}
        </div>

        {/* Period tabs */}
        <div style={styles.tabRow}>
          {periods.map(p => (
            <button
              key={p.key}
              style={{ ...styles.periodTab, ...(period === p.key ? styles.periodTabActive : {}) }}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>

        {/* Loading skeleton */}
        {loading && (
          <div style={styles.skeletonWrap}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ ...styles.skeleton, opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={styles.errorBox}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div style={{ marginTop: 8, opacity: 0.7 }}>{error}</div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rows.length === 0 && (
          <div style={styles.errorBox}>
            <span style={{ fontSize: 32 }}>📭</span>
            <div style={{ marginTop: 8, opacity: 0.6 }}>Belum ada data</div>
          </div>
        )}

        {/* Top 3 podium */}
        {!loading && !error && top.length > 0 && (
          <div style={styles.podium}>
            {/* Render order: 2nd, 1st, 3rd */}
            {[1, 0, 2].map(i => {
              const u = top[i];
              if (!u) return <div key={i} style={{ flex: 1 }} />;
              return (
                <div key={u.user_id} style={{ ...styles.podiumCard, flex: 1 }}>
                  {i === 0 && <div style={styles.crownGlow} />}
                  <div
                    style={{
                      ...styles.medalBadge,
                      background: MEDAL_BG[i],
                      color: MEDAL_TEXT[i],
                    }}
                  >
                    {MEDAL_LABEL[i]}
                  </div>
                  <div style={styles.avatarWrap}>
                    <img
                      src={avatar(u.avatar_seed)}
                      alt=""
                      style={{
                        ...styles.avatarImg,
                        width:  i === 0 ? 64 : 52,
                        height: i === 0 ? 64 : 52,
                        border: `2px solid ${MEDAL_BG[i]}44`,
                      }}
                    />
                  </div>
                  <div style={styles.podiumName}>
                    {u.display_name.length > 10
                      ? u.display_name.slice(0, 9) + "…"
                      : u.display_name}
                  </div>
                  <div style={{ ...styles.podiumValue, color: MEDAL_BG[i] }}>
                    {fmt(u.value)} <span style={styles.unit}>{u.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rank list (#4 and below) */}
        {!loading && !error && rest.length > 0 && (
          <div style={styles.list}>
            {rest.map(u => (
              <div key={u.user_id} style={styles.listRow}>
                <div style={styles.rankNum}>#{u.rank}</div>
                <img
                  src={avatar(u.avatar_seed)}
                  alt=""
                  style={styles.listAvatar}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={styles.listName}>{u.display_name}</div>
                  {u.username && (
                    <div style={styles.listUsername}>@{u.username}</div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={styles.listValue}>{fmt(u.value)}</div>
                  <div style={styles.unit}>{u.unit}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight:       "100vh",
    background:      "#020617",
    color:           "#f1f5f9",
    fontFamily:      "'DM Sans', 'Segoe UI', sans-serif",
    position:        "relative",
    overflowX:       "hidden",
  },
  bgGlow: {
    position:        "fixed",
    top:             -200,
    left:            "50%",
    transform:       "translateX(-50%)",
    width:           600,
    height:          400,
    borderRadius:    "50%",
    background:      "radial-gradient(ellipse, #1e3a5f44 0%, transparent 70%)",
    pointerEvents:   "none",
    zIndex:          0,
  },
  header: {
    position:        "sticky",
    top:             0,
    zIndex:          10,
    background:      "linear-gradient(180deg, #020617 60%, #02061700 100%)",
    padding:         "16px 16px 8px",
  },
  headerInner: {
    display:         "flex",
    justifyContent:  "space-between",
    alignItems:      "baseline",
    marginBottom:    12,
  },
  headerTitle: {
    fontSize:        18,
    fontWeight:      700,
    letterSpacing:   "-0.3px",
  },
  headerSub: {
    fontSize:        12,
    opacity:         0.45,
    textTransform:   "uppercase",
    letterSpacing:   "0.08em",
  },
  tabRow: {
    display:         "flex",
    gap:             6,
    marginBottom:    8,
  },
  tab: {
    flex:            1,
    padding:         "8px 0",
    borderRadius:    10,
    border:          "1px solid #ffffff14",
    background:      "transparent",
    color:           "#94a3b8",
    fontSize:        13,
    fontWeight:      600,
    cursor:          "pointer",
    transition:      "all .15s",
  },
  tabActive: {
    background:      "linear-gradient(135deg, #1e40af, #0369a1)",
    color:           "#fff",
    border:          "1px solid #3b82f680",
  },
  periodTab: {
    flex:            1,
    padding:         "6px 0",
    borderRadius:    8,
    border:          "1px solid #ffffff0c",
    background:      "transparent",
    color:           "#64748b",
    fontSize:        12,
    cursor:          "pointer",
    transition:      "all .15s",
  },
  periodTabActive: {
    background:      "#ffffff12",
    color:           "#e2e8f0",
    border:          "1px solid #ffffff20",
  },
  content: {
    padding:         "4px 16px 32px",
    position:        "relative",
    zIndex:          1,
  },
  skeletonWrap: {
    display:         "flex",
    flexDirection:   "column",
    gap:             8,
    marginTop:       8,
  },
  skeleton: {
    height:          58,
    borderRadius:    14,
    background:      "linear-gradient(90deg, #0f172a, #1e293b, #0f172a)",
    backgroundSize:  "200% 100%",
    animation:       "shimmer 1.4s infinite",
  },
  errorBox: {
    textAlign:       "center",
    padding:         "60px 20px",
    color:           "#94a3b8",
    fontSize:        14,
  },
  podium: {
    display:         "flex",
    gap:             8,
    marginBottom:    16,
    alignItems:      "flex-end",
  },
  podiumCard: {
    background:      "linear-gradient(160deg, #0f172a, #1e293b)",
    border:          "1px solid #ffffff10",
    borderRadius:    16,
    padding:         "12px 8px",
    textAlign:       "center",
    position:        "relative",
    overflow:        "hidden",
  },
  crownGlow: {
    position:        "absolute",
    top:             -40,
    left:            "50%",
    transform:       "translateX(-50%)",
    width:           80,
    height:          80,
    borderRadius:    "50%",
    background:      "radial-gradient(circle, #F59E0B33, transparent 70%)",
    pointerEvents:   "none",
  },
  medalBadge: {
    display:         "inline-flex",
    alignItems:      "center",
    justifyContent:  "center",
    fontSize:        14,
    borderRadius:    20,
    padding:         "2px 8px",
    marginBottom:    8,
    fontWeight:      700,
  },
  avatarWrap: {
    display:         "flex",
    justifyContent:  "center",
    marginBottom:    6,
  },
  avatarImg: {
    borderRadius:    12,
    objectFit:       "cover",
    background:      "#0f172a",
  },
  podiumName: {
    fontSize:        11,
    fontWeight:      600,
    color:           "#e2e8f0",
    marginBottom:    2,
    overflow:        "hidden",
    textOverflow:    "ellipsis",
    whiteSpace:      "nowrap",
  },
  podiumValue: {
    fontSize:        13,
    fontWeight:      700,
  },
  list: {
    display:         "flex",
    flexDirection:   "column",
    gap:             6,
  },
  listRow: {
    display:         "flex",
    alignItems:      "center",
    gap:             10,
    background:      "linear-gradient(135deg, #0f172a, #1a2540)",
    border:          "1px solid #ffffff0a",
    borderRadius:    14,
    padding:         "10px 12px",
  },
  rankNum: {
    width:           28,
    fontSize:        12,
    fontWeight:      700,
    color:           "#475569",
    textAlign:       "center",
    flexShrink:      0,
  },
  listAvatar: {
    width:           38,
    height:          38,
    borderRadius:    10,
    objectFit:       "cover",
    background:      "#0f172a",
    flexShrink:      0,
  },
  listName: {
    fontSize:        13,
    fontWeight:      600,
    color:           "#e2e8f0",
    overflow:        "hidden",
    textOverflow:    "ellipsis",
    whiteSpace:      "nowrap",
  },
  listUsername: {
    fontSize:        11,
    color:           "#475569",
    overflow:        "hidden",
    textOverflow:    "ellipsis",
    whiteSpace:      "nowrap",
  },
  listValue: {
    fontSize:        14,
    fontWeight:      700,
    color:           "#7dd3fc",
  },
  unit: {
    fontSize:        10,
    color:           "#475569",
    textTransform:   "uppercase",
    letterSpacing:   "0.05em",
  },
};
