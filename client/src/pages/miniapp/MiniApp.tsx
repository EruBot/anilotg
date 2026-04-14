import React, { useEffect, useMemo, useRef, useState } from "react";

type View = "board" | "profile";
type Period = "mingguan" | "harian";

type LeaderboardRow = {
  rank: number;
  display_name: string;
  username?: string | null;
  value: number;
};

type ProfileUser = {
  user_id: string | number;
  first_name: string;
  username?: string | null;
  current_rank: string;
  cp_mingguan: number;
  chat_mingguan: number;
  total_chat: number;
  total_cp: number;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
          };
        };
      };
    };
  }
}

const API = "https://anilocp.vercel.app/api/miniapp";
const CHAT_ID = "-1001236366475";

export default function MiniApp(): JSX.Element {
  const [tg, setTg] = useState<NonNullable<Window["Telegram"]>["WebApp"] | null>(null);
  const [debugText, setDebugText] = useState("init...");
  const [view, setView] = useState<View>("board");
  const [period, setPeriod] = useState<Period>("mingguan");
  const [loading, setLoading] = useState(true);
  const [contentHtml, setContentHtml] = useState<string>('<div class="loading">Loading...</div>');
  const intervalRef = useRef<number | null>(null);

  const title = useMemo(() => {
    return view === "board" ? "Leaderboard Chat Point" : "Profile";
  }, [view]);

  const subtitle = useMemo(() => {
    const user = tg?.initDataUnsafe?.user;
    if (view === "board") return "Anime Lovers Indo";
    return `@${user?.username || user?.first_name || ""}`;
  }, [view, tg]);

  useEffect(() => {
    const app = window.Telegram?.WebApp ?? null;
    if (!app) return;

    setTg(app);
    app.ready();
    app.expand();
  }, []);

  useEffect(() => {
    const app = tg;
    const user = app?.initDataUnsafe?.user;

    setDebugText(
      `TG:${!!app} | len:${app?.initData?.length || 0} | id:${user?.id || "-"} | @${user?.username || "-"}`
    );
  }, [tg, view, period]);

  useEffect(() => {
    if (!tg) return;

    const app = tg;

    const waitForInitData = async () => {
      let tries = 0;

      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      intervalRef.current = window.setInterval(() => {
        const user = app.initDataUnsafe?.user;
        setDebugText(
          `TG:${!!app} | len:${app.initData?.length || 0} | id:${user?.id || "-"} | @${user?.username || "-"}`
        );

        if ((app.initData && app.initData.length > 50) || tries++ > 50) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          loadBoard();
        }
      }, 100);
    };

    void waitForInitData();

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tg]);

  async function loadBoard() {
    const app = tg;
    if (!app) return;

    setView("board");
    setLoading(true);
    setContentHtml('<div class="loading">Loading...</div>');

    const r = await fetch(`${API}/leaderboard?chat_id=${CHAT_ID}&type=cp&period=${period}`);
    const d = await r.json();

    const rows: LeaderboardRow[] = d.rows || [];
    const html =
      rows
        .map(
          (x) => `
        <div class="card row">
          <div class="rank">#${x.rank}</div>
          <div style="flex:1">
            <div class="name">${escapeHtml(x.display_name)}</div>
            ${x.username ? `<div class="user">@${escapeHtml(x.username)}</div>` : ""}
          </div>
          <div class="val">${Number(x.value).toLocaleString("id-ID")}</div>
        </div>`
        )
        .join("") || '<div class="loading">Kosong</div>';

    setContentHtml(html);
    setLoading(false);
  }

  async function loadProfile() {
    const app = tg;
    if (!app) return;

    setView("profile");
    setLoading(true);
    setContentHtml('<div class="loading">Loading profile...</div>');

    const r = await fetch(`${API}/profile?chat_id=${CHAT_ID}`, {
      headers: { "X-Telegram-Init-Data": app.initData || "" },
    });
    const d = await r.json();
    const u: ProfileUser = d.user;

    const userImgSeed = encodeURIComponent(u.username || u.first_name);

    const html = `
      <div class="card" style="text-align:center;padding:20px">
        <img src="https://api.dicebear.com/9.x/thumbs/svg?seed=${userImgSeed}" style="width:80px;height:80px;border-radius:16px;border:3px solid #0ea5e9" />
        <h3 style="margin:10px 0 0">${escapeHtml(u.first_name)}</h3>
        <div class="user">@${escapeHtml(u.username || String(u.user_id))}</div>
      </div>
      <div class="grid">
        <div class="card"><div class="user">🏆 Rank</div><div style="font-weight:800;font-size:18px;margin-top:4px">${escapeHtml(
          u.current_rank
        )}</div></div>
        <div class="card"><div class="user">📊 CP Minggu</div><div style="font-weight:800;font-size:18px;margin-top:4px">${Number(
          u.cp_mingguan
        ).toLocaleString("id-ID")}</div></div>
        <div class="card"><div class="user">💬 Chat Minggu</div><div style="font-weight:800;font-size:18px;margin-top:4px">${Number(
          u.chat_mingguan
        ).toLocaleString("id-ID")}</div></div>
        <div class="card"><div class="user">💬 Total Chat</div><div style="font-weight:800;font-size:18px;margin-top:4px">${Number(
          u.total_chat
        ).toLocaleString("id-ID")}</div></div>
      </div>
      <div class="big"><div style="font-size:12px;opacity:.8">⚡ TOTAL CP</div><div style="font-size:28px;font-weight:900">${Number(
        u.total_cp
      ).toLocaleString("id-ID")}</div></div>
    `;

    setContentHtml(html);
    setLoading(false);
  }

  useEffect(() => {
    if (!tg) return;

    if (view === "board") {
      void loadBoard();
    } else {
      void loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, view, tg]);

  const handleTabClick = (p: Period) => {
    setPeriod(p);
  };

  const handleBoardClick = () => {
    setView("board");
  };

  const handleProfileClick = () => {
    setView("profile");
  };

  return (
    <div style={styles.page}>
      <style>{cssText}</style>

      <div id="debug" className="debug">
        {debugText}
      </div>

      <h2 id="title">{title}</h2>
      <div id="subtitle" className="sub">
        {subtitle}
      </div>

      <div id="board-controls" className="tabs" style={{ display: view === "board" ? "flex" : "none" }}>
        <button
          className={`tab ${period === "mingguan" ? "active" : ""}`}
          data-p="mingguan"
          onClick={() => handleTabClick("mingguan")}
        >
          Mingguan
        </button>
        <button
          className={`tab ${period === "harian" ? "active" : ""}`}
          data-p="harian"
          onClick={() => handleTabClick("harian")}
        >
          Harian
        </button>
      </div>

      <div
        id="content"
        className={loading ? "loading" : ""}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      <div className="nav">
        <button id="btn-board" className={`navbtn ${view === "board" ? "active" : ""}`} onClick={handleBoardClick}>
          📊 Board
        </button>
        <button
          id="btn-profile"
          className={`navbtn ${view === "profile" ? "active" : ""}`}
          onClick={handleProfileClick}
        >
          👤 Profile
        </button>
      </div>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "#e2e8f0",
  },
};

const cssText = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#020617;color:#e2e8f0;font-family:system-ui,-apple-system,Segoe UI,Roboto;padding:16px 14px 90px}
h2{margin:0 0 4px;font-weight:800}
.sub{font-size:12px;opacity:.6;margin-bottom:12px}
.tabs{display:flex;gap:8px;margin-bottom:12px}
button{font:inherit;cursor:pointer}
.tab{flex:1;padding:10px;border-radius:10px;border:1px solid #1e293b;background:#0f172a;color:#fff;font-weight:700}
.tab.active{background:#2563eb;border-color:#2563eb}
.card{background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px;margin-bottom:8px}
.row{display:flex;align-items:center;gap:10px}
.rank{width:28px;color:#64748b;font-weight:700}
.name{flex:1;font-weight:700}
.user{font-size:11px;opacity:.6}
.val{font-weight:800;color:#7dd3fc}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.big{background:linear-gradient(135deg,#1e40af,#0ea5e9);padding:18px;border-radius:16px;text-align:center;margin-top:12px}
.nav{position:fixed;left:0;right:0;bottom:0;display:flex;gap:8px;padding:10px;background:#020617ee;border-top:1px solid #1e293b}
.navbtn{flex:1;padding:12px;border-radius:10px;border:1px solid #1e293b;background:#0f172a;color:#fff;font-weight:700}
.navbtn.active{background:#2563eb}
.loading{opacity:.6;text-align:center;padding:40px}
.debug{background:#f59e0b22;border:1px solid #f59e0b;padding:6px 8px;border-radius:8px;font-size:11px;margin-bottom:10px;font-family:monospace}
`;
