import { useEffect, useMemo, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";

type Type = "cp" | "chat";
type Period = "harian" | "mingguan" | "lifetime";

type Row = {
  rank: number;
  user_id: string;
  display_name: string;
  username?: string;
  value: number;
  unit: string;
  avatar_seed: string;
};

function getTG() {
  return (window as any)?.Telegram?.WebApp;
}

function avatar(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export default function MiniApp() {
  const tg = useMemo(() => getTG(), []);

  const [chatId, setChatId] = useState<string | null>(null);
  const [type, setType] = useState<Type>("cp");
  const [period, setPeriod] = useState<Period>("harian");

  const [rows, setRows] = useState<Row[]>([]);
  const [top, setTop] = useState<Row[]>([]);
  const [me, setMe] = useState<Row | null>(null);

  const [loading, setLoading] = useState(true);

  // 🔥 INIT (Telegram + fallback URL)
  useEffect(() => {
  if (tg) {
    tg.ready();
    tg.expand();

    const start = tg.initDataUnsafe?.start_param;

    if (start) {
      const p = new URLSearchParams(start);
      const cid = p.get("chat_id");

      if (cid) {
        setChatId(cid);
        return;
      }
    }
  }

  // fallback URL (WAJIB)
  const params = new URLSearchParams(window.location.search);
  const urlChatId = params.get("chat_id");

  if (urlChatId) {
    setChatId(urlChatId);
  }
}, [tg]);
  

    // 🔥 FALLBACK (browser test)
    const params = new URLSearchParams(window.location.search);
    const urlChatId = params.get("chat_id");

    if (urlChatId) {
      setChatId(urlChatId);
    }
  }, [tg]);

  // 🔥 FETCH API (FIXED)
  useEffect(() => {
    if (!chatId) return;

    let active = true;

    async function load() {
      setLoading(true);

      try {
        const res = await fetch(
          `https://anilocp.vercel.app/api/miniapp/leaderboard?chat_id=${chatId}&type=${type}&period=${period}`,
          {
            headers: {
              "X-Telegram-Init-Data": tg?.initData || "",
            },
          }
        );

        const json = await res.json();

        if (!active) return;

        // 🔥 FIX WAJIB
        if (!json.ok) {
          console.error("API ERROR:", json.error);
          setRows([]);
          setTop([]);
          setMe(null);
          return;
        }

        setRows(json.rows || []);
        setTop(json.top_three || []);
        setMe(json.me || null);
      } catch (e) {
        console.error("FETCH ERROR:", e);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [chatId, type, period, tg]);

  // 🔥 GUARD (biar ga blank)
  if (!chatId) {
    return (
      <div className="text-white p-4">
        Waiting for chat context...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Leaderboard {type.toUpperCase()}
          </h1>

          <button
            onClick={() => setPeriod("harian")}
            className="text-sm opacity-70"
          >
            {period}
          </button>
        </div>

        {/* TOGGLE */}
        <div className="flex gap-2">
          <button onClick={() => setType("cp")}>CP</button>
          <button onClick={() => setType("chat")}>Chat</button>
        </div>

        {/* LOADING */}
        {loading && <div>Loading...</div>}

        {/* TOP 3 */}
        <div className="grid grid-cols-3 gap-2">
          {(top || []).map((u, i) => (
            <div key={u.user_id} className="bg-white/5 p-3 rounded-xl text-center">
              <img src={avatar(u.avatar_seed)} className="w-12 mx-auto" />

              <div className="mt-2 font-semibold">{u.display_name}</div>

              <div className="text-xs opacity-70">
                {u.value} {u.unit}
              </div>

              {i === 0 && <Crown className="mx-auto mt-1 text-yellow-300" />}
              {i > 0 && <Medal className="mx-auto mt-1" />}
            </div>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-2">
          {(rows || []).map((u) => (
            <div
              key={u.user_id}
              className="flex items-center gap-3 bg-white/5 p-3 rounded-xl"
            >
              <div className="w-8 text-center">#{u.rank}</div>

              <img src={avatar(u.avatar_seed)} className="w-10 rounded-lg" />

              <div className="flex-1">
                <div>{u.display_name}</div>
                <div className="text-xs opacity-60">
                  @{u.username || "anon"}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">{u.value}</div>
                <div className="text-xs opacity-60">{u.unit}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ME */}
        {me && (
          <div className="bg-cyan-500/10 p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <Trophy />
              <div>
                #{me.rank} — {me.display_name} ({me.value} {me.unit})
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
