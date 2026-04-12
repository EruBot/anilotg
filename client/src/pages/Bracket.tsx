import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
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
  const src = isPlainObject(source) ? (source as any) : {};
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
    const src = isPlainObject(round1Source[i]) ? (round1Source[i] as any) : {};
    return buildMatch(
      i + 1,
      isText(src.teamA) ? src.teamA : `Slot ${i * 2 + 1}`,
      isText(src.teamB) ? src.teamB : `Slot ${i * 2 + 2}`,
      src
    );
  });

  const quarter: Match[] = Array.from({ length: 4 }, (_, i) => {
    const src = isPlainObject(quarterSource[i]) ? (quarterSource[i] as any) : {};
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
    const src = isPlainObject(semiSource[i]) ? (semiSource[i] as any) : {};
    const fallbackA = quarter[i * 2]?.winner || "TBD";
    const fallbackB = quarter[i * 2 + 1]?.winner || "TBD";

    return buildMatch(
      13 + i,
      isText(src.teamA) ? src.teamA : fallbackA,
      isText(src.teamB) ? src.teamB : fallbackB,
      src
    );
  });

  const firstFinal = isPlainObject(finalSource[0]) ? (finalSource[0] as any) : {};
  const firstThird = isPlainObject(thirdSource[0]) ? (thirdSource[0] as any) : {};

  const final: Match[] = [
    buildMatch(
      15,
      isText(firstFinal.teamA) ? firstFinal.teamA : semi[0]?.winner || "TBD",
      isText(firstFinal.teamB) ? firstFinal.teamB : semi[1]?.winner || "TBD",
      firstFinal
    ),
  ];

  const third: Match[] = [
    buildMatch(
      16,
      isText(firstThird.teamA) ? firstThird.teamA : loserOf(semi[0]),
      isText(firstThird.teamB) ? firstThird.teamB : loserOf(semi[1]),
      firstThird
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

const formatTeamLabel = (team: string) => {
  const clean = cleanText(team) || "TBD";
  if (clean === "TBD") return clean;
  return clean;
};

const getMatchStatus = (match: Match) => {
  if (match.winner) return "Completed";
  if (match.time) return "Scheduled";
  if (match.teamA !== "TBD" || match.teamB !== "TBD") return "Open";
  return "Pending";
};

const roundLabel = (id: number) => {
  if (id <= 8) return "16 Besar";
  if (id <= 12) return "8 Besar";
  if (id <= 14) return "Semi Final";
  if (id === 15) return "Final";
  return "Juara 3";
};

export default function BracketPage() {
  const [data, setData] = useState<BracketState>(() => createDefaultState());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
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

  const selectedHistory = useMemo(() => {
    if (!selectedTeam || selectedTeam === "TBD") return [];
    return allMatches.filter(
      (m) => m.teamA === selectedTeam || m.teamB === selectedTeam || m.winner === selectedTeam
    );
  }, [selectedTeam, allMatches]);

  const selectedWins = useMemo(() => {
    if (!selectedTeam) return 0;
    return selectedHistory.filter((m) => m.winner === selectedTeam).length;
  }, [selectedTeam, selectedHistory]);

  const selectedLosses = useMemo(() => {
    if (!selectedTeam) return 0;
    return selectedHistory.filter((m) => m.winner && m.winner !== selectedTeam).length;
  }, [selectedTeam, selectedHistory]);

  const setRoute = (next: ViewKey) => {
    const hash = VIEW_HASH[next];
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTeam = (team: string) => {
    setSelectedTeam(team);
  };

  const closeModal = () => {
    setSelectedTeam(null);
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
    const placeholder = isPlaceholderTeam(team);

    return (
      <button
        type="button"
        onClick={() => openTeam(team)}
        className={[
          "group flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
          "border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50",
          isWinner ? "bg-gradient-to-r from-fuchsia-50 to-cyan-50 border-fuchsia-200" : "",
          placeholder ? "opacity-95" : "",
        ].join(" ")}
      >
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">
            {formatTeamLabel(team)}
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Team
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5">
          {isWinner && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
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
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : status === "Scheduled"
          ? "bg-cyan-100 text-cyan-700 border-cyan-200"
          : status === "Open"
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : "bg-slate-100 text-slate-500 border-slate-200";

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2.5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {roundLabel(match.id)}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900">
              Match {match.id}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              <Clock3 className="inline-block h-3.5 w-3.5 -translate-y-0.5" />{" "}
              {match.time || "-"}
            </span>
            <span
              className={[
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                statusClass,
              ].join(" ")}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          <TeamButton team={match.teamA} match={match} isWinner={match.winner === match.teamA} />
          <TeamButton team={match.teamB} match={match} isWinner={match.winner === match.teamB} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-3 py-2.5 text-xs text-slate-600">
          <span className="uppercase tracking-[0.18em] text-slate-400">
            Wasit
          </span>
          <span className="font-medium text-slate-900">
            {match.wasit || "-"}
          </span>
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
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg">
        <div className={`border-b border-slate-200 bg-gradient-to-r ${gradient} px-4 py-3.5`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/75 p-2.5 backdrop-blur-md">
                <Icon className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
                <p className="text-[11px] text-slate-700/80 sm:text-xs">{subtitle}</p>
              </div>
            </div>

            <div className="rounded-full bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              {items.length} match
            </div>
          </div>
        </div>

        <div className="space-y-2.5 p-3.5 sm:p-4">
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
          gradient="from-fuchsia-50 via-violet-50 to-cyan-50"
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
          gradient="from-cyan-50 via-sky-50 to-indigo-50"
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
          gradient="from-violet-50 via-fuchsia-50 to-rose-50"
        />
      );
    }

    return (
      <div className="space-y-4">
        <SectionBlock
          title="Final"
          subtitle="Penentuan juara 1 & 2"
          icon={Crown}
          items={data.final}
          gradient="from-amber-50 via-orange-50 to-rose-50"
        />

        <SectionBlock
          title="Juara 3"
          subtitle="Perebutan podium"
          icon={Trophy}
          items={data.third}
          gradient="from-emerald-50 via-teal-50 to-cyan-50"
        />
      </div>
    );
  };

  const ModalStat = ({
    label,
    value,
  }: {
    label: string;
    value: number;
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-[-8rem] h-80 w-80 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="absolute right-[-8rem] top-24 h-[24rem] w-[24rem] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-violet-200/35 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-4 pb-28 lg:px-6 lg:py-6">
        <header className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur-xl sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                <Sparkles className="h-4 w-4" />
                Bracket
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                ANILO Tournament
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
                Tampilan ringan, cepat, dan sinkron dengan bot Telegram.
              </p>
            </div>

            <div className="hidden rounded-2xl bg-slate-50 px-4 py-3 text-right sm:block">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Live</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {loading ? "Syncing" : error ? "Fallback" : "Online"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Teams</p>
              <p className="mt-1 text-lg font-black text-slate-900">{stats.activeTeams}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Wins</p>
              <p className="mt-1 text-lg font-black text-slate-900">{stats.winners}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Schedule</p>
              <p className="mt-1 text-lg font-black text-slate-900">{stats.scheduled}</p>
            </div>
          </div>
        </header>

        <section className="mt-5">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Bracket Section
              </p>
              <h2 className="mt-1.5 text-2xl font-bold text-slate-900 sm:text-3xl">
                {view === "round16"
                  ? "16 Besar"
                  : view === "quarter"
                    ? "8 Besar"
                    : view === "semi"
                      ? "Semi Final"
                      : "Final"}
              </h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm lg:flex">
              <RefreshCw className="h-4 w-4 text-cyan-600" />
              Auto refresh 8s
            </div>
          </div>

          <ViewContent />
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 p-3">
        <div className="mx-auto max-w-3xl rounded-[1.35rem] border border-slate-200 bg-white/92 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { key: "round16", label: "16 Besar" },
                { key: "quarter", label: "8 Besar" },
                { key: "semi", label: "Semi" },
                { key: "final", label: "Final" },
              ] as { key: ViewKey; label: string }[]
            ).map((item) => {
              const active = view === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRoute(item.key)}
                  className={[
                    "rounded-2xl px-2.5 py-3 text-xs font-semibold transition-all duration-300 sm:text-sm",
                    active
                      ? "bg-gradient-to-r from-cyan-600 to-violet-600 text-white shadow-md"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-200 bg-gradient-to-r from-fuchsia-50 via-white to-cyan-50 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    Team Profile
                  </p>
                  <h3 className="mt-1.5 text-2xl font-black text-slate-900">
                    {selectedTeam}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:bg-slate-50"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                <ModalStat label="Match" value={selectedHistory.length} />
                <ModalStat label="Menang" value={selectedWins} />
                <ModalStat label="Kalah" value={selectedLosses} />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Statistik tim dari bracket aktif.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
