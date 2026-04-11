import React from "react";
import { communityStats } from "@/lib/communityData";
import { Send } from "lucide-react";

type TeamSlot = {
  slot: string;
  status: string;
};

const teamSlots: TeamSlot[] = [
  { slot: "Slot 01", status: "Tersedia" },
  { slot: "Slot 02", status: "Tersedia" },
  { slot: "Slot 03", status: "Tersedia" },
  { slot: "Slot 04", status: "Tersedia" },
  { slot: "Slot 05", status: "Tersedia" },
  { slot: "Slot 06", status: "Tersedia" },
  { slot: "Slot 07", status: "Tersedia" },
  { slot: "Slot 08", status: "Tersedia" },
  { slot: "Slot 09", status: "Tersedia" },
  { slot: "Slot 10", status: "Tersedia" },
  { slot: "Slot 11", status: "Tersedia" },
  { slot: "Slot 12", status: "Tersedia" },
  { slot: "Slot 13", status: "Tersedia" },
  { slot: "Slot 14", status: "Tersedia" },
  { slot: "Slot 15", status: "Tersedia" },
  { slot: "Slot 16", status: "Tersedia" },
];

const rules = [
  "Format pertandingan: 5 vs 5, single elimination.",
  "Setiap tim wajib hadir 10 menit sebelum match dimulai.",
  "Keterlambatan lebih dari 10 menit dianggap walkover.",
  "Dilarang memakai bug, cheat, script, atau exploit.",
  "Keputusan panitia dan wasit bersifat final.",
];

const schedule = [
  { phase: "Pendaftaran", desc: "Buka sampai slot penuh." },
  { phase: "Technical meeting", desc: "Info bracket, rules, dan jadwal." },
  { phase: "Babak 16 besar", desc: "16 tim bertemu, 8 lolos." },
  { phase: "Perempat final", desc: "8 tim tersisa." },
  { phase: "Semifinal", desc: "4 tim terbaik." },
  { phase: "Grand final", desc: "Penentuan juara." },
];

const prizes = [
  "Juara 1 — ",
  "Juara 2 — ",
  "Juara 3 — ",
];

const WinnerList = [
  "Juara 1 — ",
  "Juara 2 — ",
  "Juara 3 — ",
];

export default function EventPage() {
  React.useEffect(() => {
  document.title = "Tournament MLBB ANILO | JKSUBINDO";
}, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            ← Kembali ke Home
          </a>
        </div>
      </div>

      <div className="h-16" />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.28),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_35%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-200">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
              Event Komunitas ANILO
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              TOURNAMENT MLBB
              <span className="block bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                ANILO 16 TIM
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Turnamen Mobile Legends untuk komunitas ANILO. Format cepat, kompetitif,
              dan langsung menuju bracket 16 tim terbaik.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#daftar"
                className="rounded-full bg-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:bg-fuchsia-400"
              >
                Daftar Sekarang
              </a>
              <a
                href="#detail"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Lihat Detail
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-2xl font-bold">PEMENANG 🏆</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Soon.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {WinnerList.map((Winlist) => (
              <div
                key={Winlist}
                className="rounded-2xl border border-white/10 bg-black/10 px-4 py-4 text-sm leading-6 text-slate-200"
              >
                {Winlist}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="detail" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Slot Tim</p>
            <p className="mt-2 text-3xl font-bold">16</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Sistem turnamen disusun untuk 16 tim dengan bracket single elimination.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Mode</p>
            <p className="mt-2 text-3xl font-bold">5 vs 5</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Pertandingan dijalankan dengan format standar tim penuh.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Sistem</p>
            <p className="mt-2 text-3xl font-bold">Single Elimination</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Sekali kalah langsung tersingkir. Semua match terasa penting.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-2xl font-bold">Jadwal Event</h2>
            <div className="mt-6 space-y-4">
              {schedule.map((item, index) => (
                <div
                  key={item.phase}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-black/10 p-4"
                >
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-fuchsia-500/20 text-sm font-bold text-fuchsia-200">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.phase}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-2xl font-bold">Peraturan Utama</h2>
            <div className="mt-6 space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6 text-slate-300"
                >
                  {rule}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-5">
              <p className="text-sm font-semibold text-fuchsia-200">Prize Pool / Reward</p>
              <div className="mt-4 space-y-2 text-sm text-slate-200">
                {prizes.map((prize) => (
                  <div key={prize} className="rounded-xl bg-white/5 px-4 py-3">
                    {prize}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="daftar" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Daftar Slot</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Setiap slot kosong bisa langsung didaftarkan ke grup panitia.
              </p>
            </div>
            <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-200">
              Status: Pendaftaran dibuka
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teamSlots.map((team) => (
              <div
                key={team.slot}
                className="rounded-2xl border border-white/10 bg-black/10 p-5 transition hover:border-fuchsia-400/30 hover:bg-white/5"
              >
                <p className="text-sm text-slate-400">{team.slot}</p>
                <p className="mt-2 text-lg font-semibold text-white">{team.status}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Slot tersedia untuk tim yang sudah siap bertanding.
                </p>
                <a
                  href="https://t.me/grup_anime_indo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-400"
                >
                  Daftar
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 p-8 text-center">
          <h2 className="text-3xl font-black">Siap Masuk Bracket?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Kumpulkan tim terbaikmu, siapkan draft, dan amankan slot sebelum penuh.
            TOURNAMENT MLBB ANILO 16 TIM dibuat untuk pertandingan yang cepat, rapi, dan kompetitif.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#daftar"
              className="rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Ambil Slot
            </a>
            <a
              href="#detail"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Baca Ulang Detail
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-purple-100 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <span className="font-bold zen-text-gradient">ANILO</span>
              </div>
              <p className="text-slate-600 text-sm">
                Anime Lovers Indo - Komunitas anime terbesar di Telegram Indonesia
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Informasi</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <span className="font-medium">Dibuat:</span> {communityStats.foundedDate}
                </li>
                <li>
                  <span className="font-medium">Member:</span> {communityStats.totalMembers}
                </li>
                <li>
                  <span className="font-medium">Chat/Hari:</span> {communityStats.chatPerDay}
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Ikuti Kami</h4>
              <a
                href={communityStats.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                <Send size={16} />
                Telegram
              </a>
            </div>
          </div>

          <div className="border-t border-purple-100 pt-8 text-center text-sm text-slate-600">
            <p>© 2020-{new Date().getFullYear()} Anime Lovers Indo. Dibuat dengan ❤️ untuk komunitas anime Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
