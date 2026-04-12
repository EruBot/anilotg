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
      round1?: unknown;
      quarter?: unknown;
      semi?: unknown;
      final?: unknown;
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

const normalizeArray = (arr: unknown): Match[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((m, i) => sanitizeMatch(m, i));
};

export default function BracketPage() {
  const [data, setData] = useState<{
    round1: Match[];
    quarter: Match[];
    semi: Match[];
    final: Match[];
  }>({
    round1: [],
    quarter: [],
    semi: [],
    final: [],
  });

  const [loading, setLoading] = useState(true);

  const requestIdRef = useRef(0);

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    const fetchData = async () => {
      const requestId = ++requestIdRef.current;

      if (controller) controller.abort();
      controller = new AbortController();

      try {
        const res = await fetch(
          "https://a18791-0ea9.c.jrnm.app/api/bracket",
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error();

        const json: APIData = await res.json();

        if (!active || requestId !== requestIdRef.current) return;

        let round1: Match[] = [];
        let quarter: Match[] = [];
        let semi: Match[] = [];
        let final: Match[] = [];

        if (Array.isArray(json)) {
          round1 = normalizeArray(json);
        } else if (json && typeof json === "object") {
          round1 = normalizeArray(json.round1);
          quarter = normalizeArray(json.quarter);
          semi = normalizeArray(json.semi);
          final = normalizeArray(json.final);

          if (!round1.length) {
            round1 = normalizeArray(json.matches);
          }
        }

        setData({ round1, quarter, semi, final });
      } catch {
        if (!active) return;

        setData({
          round1: [],
          quarter: [],
          semi: [],
          final: [],
        });
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
      <div className="p-4 w-56 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
        <div className="text-xs text-slate-400 mb-2">Match {m.id}</div>

        <div className="space-y-1">
          <div className={`flex justify-between ${isAWin ? "font-semibold text-purple-600" : ""}`}>
            <span>{m.teamA}</span>
            {isAWin && <span className="text-xs bg-purple-100 px-2 rounded">WIN</span>}
          </div>

          <div className="text-center text-xs text-slate-400">vs</div>

          <div className={`flex justify-between ${isBWin ? "font-semibold text-purple-600" : ""}`}>
            <span>{m.teamB}</span>
            {isBWin && <span className="text-xs bg-purple-100 px-2 rounded">WIN</span>}
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500 space-y-1">
          <div>Winner: {m.winner || "-"}</div>
          <div>Wasit: {m.wasit || "-"}</div>
          <div>Time: {m.time || "-"}</div>
        </div>
      </div>
    );
  };

  const Section = ({ title, items }: { title: string; items: Match[] }) => (
    <div className="flex flex-col gap-6 min-w-[220px]">
      <div className="text-sm font-semibold text-slate-700 text-center">
        {title}
      </div>
      {items.length ? items.map(renderMatch) : (
        <div className="text-xs text-slate-400 text-center">No data</div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading bracket...
      </div>
    );
  }

  const empty =
    !data.round1.length &&
    !data.quarter.length &&
    !data.semi.length &&
    !data.final.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800">
            Tournament Bracket
          </h1>
          <p className="text-sm text-slate-500">
            Real-time update dari sistem pertandingan
          </p>
        </div>

        {empty && (
          <div className="text-center text-slate-400 py-10">
            Data bracket belum tersedia
          </div>
        )}

        <div className="flex gap-10 overflow-x-auto pb-4">
          <Section title="Round 16" items={data.round1} />
          <Section title="Quarter Final" items={data.quarter} />
          <Section title="Semi Final" items={data.semi} />
          <Section title="Final" items={data.final} />
        </div>

      </div>
    </div>
  );
}
