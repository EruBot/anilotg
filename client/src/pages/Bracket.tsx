import React, { useEffect, useState } from "react";

type Match = {
  id: number;
  teamA: string;
  teamB: string;
  winner: string | null;
};

export default function BracketPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://a18791-0ea9.c.jrnm.app/api/bracket");

        if (!res.ok) {
          throw new Error("API error");
        }

        const data = await res.json();
        console.log("API:", data);

        if (Array.isArray(data)) {
          setMatches(data);
        } else if (data && Array.isArray(data.matches)) {
          setMatches(data.matches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error("FETCH ERROR:", err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen zen-gradient p-6">
      <div className="container max-w-4xl mx-auto">

        {/* TITLE */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold zen-text-gradient">
            Bracket Tournament
          </h1>
          <p className="text-slate-600 mt-2">
            Update otomatis dari admin via Telegram
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center text-slate-500">Loading...</p>
        )}

        {/* EMPTY */}
        {!loading && matches.length === 0 && (
          <p className="text-center text-slate-500">
            Tidak ada data bracket
          </p>
        )}

        {/* MATCH LIST */}
        <div className="space-y-4">
          {matches?.map((match) => (
            <div
              key={match.id}
              className="p-5 rounded-2xl bg-white/80 backdrop-blur border border-purple-100 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="font-medium text-slate-700">
                  Match {match.id}
                </div>

                <div className="text-sm text-slate-500">
                  Winner:{" "}
                  <span className="font-semibold text-purple-600">
                    {match.winner || "-"}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-lg font-semibold text-slate-800">
                {match.teamA} vs {match.teamB}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
