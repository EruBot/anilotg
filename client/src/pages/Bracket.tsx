import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock3,
  Crown,
  Medal,
  RefreshCw,
  Shield,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  X,
  ChevronRight,
} from "lucide-react";

type Match = {
  id: number;
  teamA: string;
  teamB: string;
  winner: string | null;
  wasit: string | null;
  time: string | null;
};

type ParticipantsMap = Record<string, string[]>;

type BracketState = {
  round1: Match[];
  quarter: Match[];
  semi: Match[];
  final: Match[];
  third: Match[];
  participants: ParticipantsMap;
};

type APIData =
  | {
      matches?: unknown;
      round1?: unknown;
      quarter?: unknown;
      semi?: unknown;
      final?: unknown;
      third?: unknown;
      participants?: unknown;
    }
  | unknown[];

type ViewKey = "round16" | "quarter" | "semi" | "final";

const API_URL =
  ((import.meta as any)?.env?.VITE_BRACKET_API_URL as string | undefined) ||
  "https://a18791-0ea9.c.jrnm.app/api/bracket";

const VIEW_HASH: Record<ViewKey, string> = {
  round16: "#16besar",
  quarter: "#8besar",
  semi: "#semifinal",
  final: "#final",
};

const HASH_VIEW: Record<string, ViewKey> = {
  "#16besar": "round16",
  "#8besar": "quarter",
  "#semifinal": "semi",
  "#final": "final",
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const isText = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const cleanText = (v: unknown) => (isText(v) ? v.trim() : "");

const isPlaceholderTeam = (team: string) => {
  const t = cleanText(team);
  return t === "TBD" || /^Slot \d+$/.test(t);
};

const parseParticipantNames = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.map((item) => cleanText(item)).filter(Boolean))
    );
  }

  if (isText(value)) {
    return Array.from(
      new Set(
        value
          .split(/[|,;/\n]+/g)
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  }

  return [];
};

const normalizeParticipants = (raw: unknown): ParticipantsMap => {
  if (!isPlainObject(raw)) return {};

  const result: ParticipantsMap = {};
  for (const [team, value] of Object.entries(raw)) {
    const teamKey = cleanText(team);
    const names = parseParticipantNames(value);
    if (teamKey && names.length) {
      result[teamKey] = names;
    }
  }
  return result;
};

const buildMatch = (
  id: number,
  teamA: unknown,
  teamB: unknown,
  source?: unknown
): Match => {
  const src = isPlainObject(source) ? source : {};
  const a = cleanText(teamA) || "TBD";
  const b = cleanText(teamB) || "TBD";

  const winner =
    isText(src.winner) && (src.winner === a || src.winner === b)
      ? src.winner.trim()
      : null;

  return {
    id,
    teamA: a,
    teamB: b,
    winner,
    wasit: isText(src.wasit) ? src.wasit.trim() : null,
    time: isText(src.time) ? src.time.trim() : null,
  };
};

const loserOf = (match?: Match) => {
  if (!match || !isText(match.winner)) return "TBD";
  if (match.winner === match.teamA) return cleanText(match.teamB) || "TBD";
  if (match.winner === match.teamB) return cleanText(match.teamA) || "TBD";
  return "TBD";
};

const createDefaultState = (): BracketState => ({
  round1: Array.from({ length: 8 }, (_, i) =>
    buildMatch(i + 1, `Slot ${i * 2 + 1}`, `Slot ${i * 2 + 2}`)
  ),
  quarter: Array.from({ length: 4 }, (_, i) => buildMatch(9 + i, "TBD", "TBD")),
  semi: Array.from({ length: 2 }, (_, i) => buildMatch(13 + i, "TBD", "TBD")),
  final: [buildMatch(15, "TBD", "TBD")],
  third: [buildMatch(16, "TBD", "TBD")],
  participants: {},
});

const normalizeBracket = (raw: APIData): BracketState => {
  const input = Array.isArray(raw) ? { matches: raw } : isPlainObject(raw) ? raw : {};

  const participants = normalizeParticipants(input.participants);

  const round1Source = Array.isArray(input.round1)
    ? input.round1
    : Array.isArray(input.matches)
      ? input.matches
      : [];

  const quarterSource = Array.isArray(input.quarter) ? input.quarter : [];
  const semiSource = Array.isArray(input.semi) ? input.semi : [];
  const finalSource = Array.isArray(input.final) ? input.final : [];
  const thirdSource = Array.isArray(input.third) ? input.third : [];

  const round1: Match[] = Array.from({ length: 8 }, (_, i) => {
    const src = isPlainObject(round1Source[i]) ? round1Source[i] : {};
    return buildMatch(
      i + 1,
      isText(src.teamA) ? src.teamA : `Slot ${i * 2 + 1}`,
      isText(src.teamB) ? src.teamB : `Slot ${i * 2 + 2}`,
      src
    );
  });

  const quarter: Match[] = Array.from({ length: 4 }, (_, i) => {
    const src = isPlainObject(quarterSource[i]) ? quarterSource[i] : {};
    const fallbackA = round1[i * 2]?.winner || "TBD";
    const fallbackB = round1[i * 2 + 1]?.winner || "TBD";

    return buildMatch(
      9 + i,
      isText(src.teamA) ? src.teamA : fallbackA,
      isText(src.teamB) ? src.teamB : fallbackB,
      src
    );
  });

  const semi: Match[] = Array.from({ length: 2 }, (_, i) => {
    const src = isPlainObject(semiSource[i]) ? semiSource[i] : {};
    const fallbackA = quarter[i * 2]?.winner || "TBD";
    const fallbackB = quarter[i * 2 + 1]?.winner || "TBD";

    return buildMatch(
      13 + i,
      isText(src.teamA) ? src.teamA : fallbackA,
      isText(src.teamB) ? src.teamB : fallbackB,
      src
    );
  });

  const final: Match[] = [
    buildMatch(
      15,
      isText(finalSource[0]?.teamA) ? finalSource[0].teamA : semi[0]?.winner || "TBD",
      isText(finalSource[0]?.teamB) ? finalSource[0].teamB : semi[1]?.winner || "TBD",
      finalSource[0]
    ),
  ];

  const third: Match[] = [
    buildMatch(
      16,
      isText(thirdSource[0]?.teamA)
        ? thirdSource[0].teamA
        : loserOf(semi[0]),
      isText(thirdSource[0]?.teamB)
        ? thirdSource[0].teamB
        : loserOf(semi[1]),
      thirdSource[0]
    ),
  ];

  return {
    round1,
    quarter,
    semi,
    final,
    third,
    participants,
  };
};

const formatTeamLabel = (team: string, participants: ParticipantsMap) => {
  const clean = cleanText(team) || "TBD";
  if (clean === "TBD") return clean;

  const members = participants[clean];
  if (members && members.length) {
    return `${clean} · ${members.join(", ")}`;
  }

  return clean;
};

const getMatchStatus = (match: Match) => {
  if (match.winner) return "Completed";
  if (match.time) return "Scheduled";
  if (match.teamA !== "TBD" || match.teamB !== "TBD") return "Open";
  return "Pending";
};

export default function BracketPage() {
  const [data, setData] = useState<BracketState>(() => createDefaultState());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [view, setView] = useState<ViewKey>("round16");
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  const requestSeq = useRef(0);

  const allMatches = useMemo(
    () => [...data.round1, ...data.quarter, ...data.semi, ...data.final, ...data.third],
    [data]
  );

  const viewMatches = useMemo(() => {
    switch (view) {
      case "round16":
        return data.round1;
      case "quarter":
        return data.quarter;
      case "semi":
        return data.semi;
      case "final":
        return data.final;
      default:
        return data.round1;
    }
  }, [view, data]);

  useEffect(() => {
    if (!selectedTeam) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selectedTeam]);

  useEffect(() => {
    const initial = HASH_VIEW[window.location.hash] || "round16";
    setView(initial);

    if (!window.location.hash) {
      window.history.replaceState(null, "", VIEW_HASH.round16);
    }

    const onHashChange = () => {
      const next = HASH_VIEW[window.location.hash] || "round16";
      setView(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    const fetchBracket = async () => {
      const seq = ++requestSeq.current;

      if (controller) controller.abort();
      controller = new AbortController();

      try {
        const res = await fetch(API_URL, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = (await res.json()) as APIData;

        if (!active || seq !== requestSeq.current) return;

        setData(normalizeBracket(json));
        setError(null);
        setLastSyncAt(new Date());
      } catch (err) {
        if (!active) return;
        if (err instanceof DOMException && err.name === "AbortError") return;

        setData(createDefaultState());
        setError("Live sync unavailable. Showing fallback bracket scaffold.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBracket();
    const interval = setInterval(fetchBracket, 8000);

    return () => {
      active = false;
      if (controller) controller.abort();
      clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => {
    const uniqueTeams = new Set<string>();
    let winners = 0;
    let scheduled = 0;

    for (const match of allMatches) {
      if (!isPlaceholderTeam(match.teamA)) uniqueTeams.add(match.teamA);
      if (!isPlaceholderTeam(match.teamB)) uniqueTeams.add(match.teamB);
      if (match.winner) winners += 1;
      if (match.time) scheduled += 1;
    }

    return {
      activeTeams: uniqueTeams.size,
      winners,
      scheduled,
      registeredTeams: Object.keys(data.participants).length,
    };
  }, [allMatches, data.participants]);

  const selectedMembers = useMemo(() => {
    if (!selectedTeam) return [];
    return data.participants[selectedTeam] || [];
  }, [selectedTeam, data.participants]);

  const selectedHistory = useMemo(() => {
    if (!selectedTeam || selectedTeam === "TBD") return [];
    return allMatches.filter(
      (m) => m.teamA === selectedTeam || m.teamB === selectedTeam || m.winner === selectedTeam
    );
  }, [selectedTeam, allMatches]);

  const setRoute = (next: ViewKey) => {
    const hash = VIEW_HASH[next];
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTeam = (team: string, match: Match) => {
    setSelectedTeam(team);
    setSelectedMatch(match);
  };

  const closeModal = () => {
    setSelectedTeam(null);
    setSelectedMatch(null);
  };

  const TeamButton = ({
    team,
    match,
    isWinner,
  }: {
    team: string;
    match: Match;
    isWinner: boolean;
  }) => {
    const members = data.participants[team] || [];
    const placeholder = isPlaceholderTeam(team);

    return (
      <button
        type="button"
        onClick={() => openTeam(team, match)}
        className={[
          "group flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-all duration-300",
          "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10",
          isWinner ? "bg-gradient-to-r from-fuchsia-500/15 to-cyan-400/15 border-fuchsia-400/30" : "",
          placeholder ? "opacity-90" : "",
        ].join(" ")}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={[
                "h-2.5 w-2.5 rounded-full",
                placeholder ? "bg-slate-500" : "bg-cyan-400",
              ].join(" ")}
            />
            <span className="truncate text-sm font-medium text-white">
              {formatTeamLabel(team, data.participants)}
            </span>
          </div>

          {members.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {members.slice(0, 3).map((member) => (
                <span
                  key={member}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-200"
                >
                  {member}
                </span>
              ))}
              {members.length > 3 && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-slate-300">
                  +{members.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-300 transition-transform duration-300 group-hover:translate-x-0.5">
          {isWinner && (
            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Win
            </span>
          )}
          <ChevronRight className="h-4 w-4" />
        </div>
      </button>
    );
  };

  const MatchCard = ({ match }: { match: Match }) => {
    const status = getMatchStatus(match);
    const statusClass =
      status === "Completed"
        ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30"
        : status === "Scheduled"
          ? "bg-cyan-400/15 text-cyan-300 border-cyan-400/30"
          : status === "Open"
            ? "bg-amber-400/15 text-amber-300 border-amber-400/30"
            : "bg-slate-400/15 text-slate-300 border-slate-400/30";

    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 hover:border-white/20">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              {match.id <= 8
                ? "Round of 16"
                : match.id <= 12
                  ? "Quarter Final"
                  : match.id <= 14
                    ? "Semi Final"
                    : match.id === 15
                      ? "Final"
                      : "Juara 3"}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-white">
              Match {match.id}
            </h3>
          </div>

          <span
            className={[
              "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              statusClass,
            ].join(" ")}
          >
            {status}
          </span>
        </div>

        <div className="space-y-2">
          <TeamButton team={match.teamA} match={match} isWinner={match.winner === match.teamA} />
          <TeamButton team={match.teamB} match={match} isWinner={match.winner === match.teamB} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-300 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/5 px-3 py-2">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Winner
            </span>
            <span className="mt-1 block font-medium text-white">
              {match.winner || "-"}
            </span>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-2">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Wasit
            </span>
            <span className="mt-1 block font-medium text-white">
              {match.wasit || "-"}
            </span>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-2 sm:col-span-2">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Time
            </span>
            <span className="mt-1 block font-medium text-white">
              {match.time || "-"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const SectionBlock = ({
    title,
    subtitle,
    icon: Icon,
    items,
    gradient,
  }: {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    items: Match[];
    gradient: string;
  }) => {
    return (
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        <div className={`border-b border-white/10 bg-gradient-to-r ${gradient} px-5 py-4`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2.5 backdrop-blur-md">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="text-xs text-white/80">{subtitle}</p>
              </div>
            </div>

            <div className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              {items.length} match
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4">
          {items.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
    );
  };

  const ViewContent = () => {
    if (view === "round16") {
      return (
        <SectionBlock
          title="16 Besar"
          subtitle="8 match awal yang dikelola bot Telegram"
          icon={Shield}
          items={viewMatches}
          gradient="from-fuchsia-500/20 via-violet-500/20 to-cyan-500/20"
        />
      );
    }

    if (view === "quarter") {
      return (
        <SectionBlock
          title="8 Besar"
          subtitle="Babak quarter final"
          icon={Trophy}
          items={viewMatches}
          gradient="from-cyan-500/20 via-sky-500/20 to-indigo-500/20"
        />
      );
    }

    if (view === "semi") {
      return (
        <SectionBlock
          title="Semi Final"
          subtitle="Babak empat besar"
          icon={Medal}
          items={viewMatches}
          gradient="from-violet-500/20 via-fuchsia-500/20 to-rose-500/20"
        />
      );
    }

    return (
      <div className="space-y-5">
        <SectionBlock
          title="Final"
          subtitle="Penentuan juara 1 & 2"
          icon={Crown}
          items={data.final}
          gradient="from-amber-500/20 via-orange-500/20 to-rose-500/20"
        />

        <SectionBlock
          title="Juara 3"
          subtitle="Perebutan podium"
          icon={Trophy}
          items={data.third}
          gradient="from-emerald-500/20 via-teal-500/20 to-cyan-500/20"
        />
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-[-8rem] h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-28 h-[30rem] w-[30rem] rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_26%)]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-5 lg:px-6 lg:py-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl lg:p-7">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(236,72,153,0.08),rgba(139,92,246,0.08),rgba(34,211,238,0.08))]" />
          <div className="relative grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Sparkles className="h-4 w-4" />
                ANILO · Bracket Navigator
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Bracket lebih mudah dibaca, lebih cepat, dan tetap kompatibel penuh dengan bot Telegram.
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Tampilan dibagi ke 4 bagian terpisah lewat hash URL supaya lebih ringan di mobile,
                lebih fokus, dan lebih mudah dipahami saat turnamen berjalan.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setRoute("round16")}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                    view === "round16"
                      ? "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400">Bagian 1</span>
                  <span className="mt-1 block text-sm font-semibold text-white">16 Besar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoute("quarter")}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                    view === "quarter"
                      ? "border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-sky-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400">Bagian 2</span>
                  <span className="mt-1 block text-sm font-semibold text-white">8 Besar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoute("semi")}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                    view === "semi"
                      ? "border-violet-400/40 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400">Bagian 3</span>
                  <span className="mt-1 block text-sm font-semibold text-white">Semi Final</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoute("final")}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left transition-all duration-300",
                    view === "final"
                      ? "border-amber-400/40 bg-gradient-to-br from-amber-500/20 to-orange-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-400">Bagian 4</span>
                  <span className="mt-1 block text-sm font-semibold text-white">Final</span>
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-fuchsia-500/15 p-2.5">
                    <RefreshCw className="h-5 w-5 text-fuchsia-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Live Sync</p>
                    <p className="text-sm font-semibold text-white">
                      {loading ? "Syncing bracket..." : error ? "Fallback mode" : "Online"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">Last sync</span>
                    <span className="mt-1 block font-medium text-white">
                      {lastSyncAt
                        ? lastSyncAt.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">Teams</span>
                    <span className="mt-1 block font-medium text-white">{stats.activeTeams}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 shadow-lg backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-500/15 p-2.5">
                    <Shield className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Bot Ready</p>
                    <p className="text-sm font-semibold text-white">
                      /add /win /time /addname /swap
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">Winners</span>
                    <span className="mt-1 block font-medium text-white">{stats.winners}</span>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">Schedules</span>
                    <span className="mt-1 block font-medium text-white">{stats.scheduled}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="relative mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {error}
            </div>
          )}
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/15 to-violet-600/15 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-fuchsia-500/15 p-2.5">
                <Users className="h-5 w-5 text-fuchsia-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Active Teams</p>
                <p className="text-2xl font-black text-white">{stats.activeTeams}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/15 to-sky-600/15 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/15 p-2.5">
                <Trophy className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Winners Set</p>
                <p className="text-2xl font-black text-white">{stats.winners}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-emerald-500/15 to-teal-600/15 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/15 p-2.5">
                <Clock3 className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Schedules</p>
                <p className="text-2xl font-black text-white">{stats.scheduled}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-orange-500/15 to-rose-600/15 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-500/15 p-2.5">
                <UserRound className="h-5 w-5 text-orange-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Team Profiles</p>
                <p className="text-2xl font-black text-white">{stats.registeredTeams}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Bracket Section
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {view === "round16"
                  ? "16 Besar"
                  : view === "quarter"
                    ? "8 Besar"
                    : view === "semi"
                      ? "Semi Final"
                      : "Final"}
              </h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur-md lg:flex">
              <ChevronRight className="h-4 w-4 text-cyan-300" />
              Tap a team to open roster
            </div>
          </div>

          <ViewContent />
        </section>
      </main>

      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f]/95 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
            <div className="border-b border-white/10 bg-gradient-to-r from-fuchsia-500/20 via-violet-500/20 to-cyan-500/20 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                    Team Profile
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                    {selectedTeam}
                  </h3>
                  <p className="mt-2 text-sm text-slate-200">
                    Klik tim untuk melihat anggota yang terdaftar dan riwayat bracket.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-white/10 bg-white/10 p-2.5 text-white transition hover:bg-white/15"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1.1fr]">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-500/15 p-3">
                    <UserRound className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Anggota Tim
                    </p>
                    <h4 className="text-lg font-semibold text-white">Daftar peserta</h4>
                  </div>
                </div>

                <div className="mt-4">
                  {selectedMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((member) => (
                        <span
                          key={member}
                          className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-100"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-300">
                      Belum ada anggota tim yang ditambahkan lewat{" "}
                      <span className="font-semibold text-white">/addname</span>.
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      Status Tim
                    </span>
                    <span className="mt-1 block font-semibold text-white">
                      {isPlaceholderTeam(selectedTeam) ? "Slot default" : "Tim aktif"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      Match Terkait
                    </span>
                    <span className="mt-1 block font-semibold text-white">
                      {selectedHistory.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-fuchsia-500/15 p-3">
                    <Shield className="h-5 w-5 text-fuchsia-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      Bracket History
                    </p>
                    <h4 className="text-lg font-semibold text-white">Riwayat pertandingan</h4>
                  </div>
                </div>

                <div className="mt-4 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                  {selectedHistory.length > 0 ? (
                    selectedHistory.map((match) => (
                      <div
                        key={`${match.id}-${selectedTeam}`}
                        className="rounded-2xl border border-white/10 bg-slate-950/75 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                              {match.id <= 8
                                ? "Round of 16"
                                : match.id <= 12
                                  ? "Quarter Final"
                                  : match.id <= 14
                                    ? "Semi Final"
                                    : match.id === 15
                                      ? "Final"
                                      : "Juara 3"}
                            </p>
                            <p className="text-sm font-semibold text-white">
                              Match {match.id}
                            </p>
                          </div>
                          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                            {getMatchStatus(match)}
                          </span>
                        </div>

                        <div className="grid gap-2 text-sm text-slate-200">
                          <div className="rounded-xl bg-white/5 px-3 py-2">
                            {formatTeamLabel(match.teamA, data.participants)}
                          </div>
                          <div className="text-center text-xs text-slate-500">vs</div>
                          <div className="rounded-xl bg-white/5 px-3 py-2">
                            {formatTeamLabel(match.teamB, data.participants)}
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">
                              Winner
                            </span>
                            <span className="mt-1 block font-medium text-white">
                              {match.winner || "-"}
                            </span>
                          </div>
                          <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">
                              Wasit
                            </span>
                            <span className="mt-1 block font-medium text-white">
                              {match.wasit || "-"}
                            </span>
                          </div>
                          <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200 sm:col-span-2">
                            <span className="block text-[10px] uppercase tracking-[0.22em] text-slate-500">
                              Time
                            </span>
                            <span className="mt-1 block font-medium text-white">
                              {match.time || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-300">
                      Tidak ada riwayat match yang ditemukan untuk tim ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
