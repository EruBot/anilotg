import React, { useEffect, useRef, useState } from "react";

type Match = {
  id: number;
  teamA: string;
  teamB: string;
  winner: string | null;
  wasit: string | null;
  time: string | null;
};

type APIData =
  | {
      matches?: unknown;
    }
  | unknown[];

const sanitizeMatch = (m: any, index: number): Match => {
  return {
    id: typeof m?.id === "number" ? m.id : index + 1,
    teamA: typeof m?.teamA === "string" && m.teamA.trim() ? m.teamA : "TBD",
    teamB: typeof m?.teamB === "string" && m.teamB.trim() ? m.teamB : "TBD",
    winner: typeof m?.winner === "string" ? m.winner : null,
    wasit: typeof m?.wasit === "string" ? m.wasit : null,
    time: typeof m?.time === "string" ? m.time : null,
  };
};

const normalize = (arr: unknown): Match[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((m, i) => sanitizeMatch(m, i));
};

export default function BracketPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const requestIdRef = useRef(0);

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    const fetchData = async () => {
      const reqId = ++requestIdRef.current;

      if (controller) controller.abort();
      controller = new AbortController();

      try {
        const res = await fetch(
          "https://a18791-0ea9.c.jrnm.app/api/bracket",
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error();

        const json: APIData = await res.json();

        if (!active || reqId !== requestIdRef.current) return;

        let data: Match[] = [];

try {
  if (Array.isArray(json)) {
    data = normalize(json);
  } else if (json && typeof json === "object") {
    const obj = json as any;

    if (Array.isArray(obj.matches)) {
      data = normalize(obj.matches);
    }
  }
} catch {
  data = [];
}

        setMatches(data);
      } catch {
        if (!active) return;
        setMatches([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000);

    return () => {
      active = false;
      if (controller) controller.abort();
      clearInterval(interval);
    };
  }, []);

  const renderMatch = (m: Match) => {
    const isAWin = m.winner === m.teamA;
    const isBWin = m.winner === m.teamB;

    return (
      <div className="relative p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10 shadow-lg hover:scale-[1.02] transition">
        <div className="text-xs text-slate-400 mb-2">
          Match {m.id}
        </div>

        <div className="space-y-1">
          <div className={`flex justify-between ${isAWin ? "text-purple-400 font-semibold" : "text-slate-200"}`}>
            <span>{m.teamA}</span>
            {isAWin && <span className="text-[10px] bg-purple-500/20 px-2 rounded">WIN</span>}
          </div>

          <div className="text-center text-xs text-slate-500">vs</div>

          <div className={`flex justify-between ${isBWin ? "text-purple-400 font-semibold" : "text-slate-200"}`}>
            <span>{m.teamB}</span>
            {isBWin && <span className="text-[10px] bg-purple-500/20 px-2 rounded">WIN</span>}
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-400 space-y-1">
          <div>Winner: {m.winner || "-"}</div>
          <div>Wasit: {m.wasit || "-"}</div>
          <div>Time: {m.time || "-"}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 bg-[#0f172a]">
        Loading tournament...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/40 via-slate-900 to-black" />

      <div className="max-w-7xl mx-auto p-6">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tournament Bracket
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Real-time update dari sistem pertandingan ANILO
          </p>
        </div>

        {/* EMPTY */}
        {matches.length === 0 && (
          <div className="text-center text-slate-500 py-20">
            Data belum tersedia
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {matches.map(renderMatch)}
        </div>

      </div>
    </div>
  );
}
