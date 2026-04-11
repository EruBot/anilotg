import React, { useState } from 'react';
// import { Avatar } from '@/components/Avatar';
import { MemberCard } from '@/components/MemberCard';
import { StatCard } from '@/components/StatCard';
import { admins, members, communityStats } from '@/lib/communityData';
import { Send, Users, MessageCircle, Calendar } from 'lucide-react';

export default function Home() {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  return (
    <div className="min-h-screen zen-gradient">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-purple-100/60">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              A
            </div>
            <span className="font-semibold text-lg tracking-tight zen-text-gradient">
              ANILO
            </span>
          </div>

          <a
            href={communityStats.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-md transition-all duration-300"
          >
            <Send size={16} />
            Bergabung
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663538373418/o2Sxqbrf6ZggVrqi6x4Wgv/hero-bg-zen-jiSuVL3UYYt9jqN232Ru7z.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />

        <div className="container relative z-10 text-center space-y-10">
          <div className="space-y-5 fade-in-up">
            <h1 className="zen-text-gradient text-4xl md:text-5xl font-bold tracking-tight">
              Anime Lovers Indo
            </h1>
            <p className="text-xl md:text-2xl font-light text-slate-600">
              Komunitas Anime Terbesar di Telegram
            </p>
          </div>

          <div className="flex justify-center fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-5xl md:text-6xl font-extrabold zen-text-gradient tracking-tight">
              ANILO
            </div>
          </div>

          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed fade-in-up" style={{ animationDelay: '0.3s' }}>
            Tempat berkumpulnya para pecinta anime di Indonesia. Diskusi seru, berbagi rekomendasi,
            dan membangun komunitas yang aktif dan solid.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 fade-in-up" style={{ animationDelay: '0.4s' }}>
            <a
              href={communityStats.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Bergabung Sekarang
            </a>

            <a
              href="#members"
              className="px-8 py-4 rounded-full bg-white border border-purple-200 text-purple-600 font-medium hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Users size={20} />
              Lihat Member
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stagger-item">
              <StatCard label="Total Member" value={communityStats.totalMembers} icon="👥" />
            </div>
            <div className="stagger-item">
              <StatCard label="Chat Per Hari" value={communityStats.chatPerDay} icon="💬" />
            </div>
            <div className="stagger-item">
              <StatCard label="Dibuat Sejak" value="2020" icon="📅" />
            </div>
            <div className="stagger-item">
              <StatCard label="Status" value="Aktif" icon="✨" />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-20 flex items-center justify-center">
        <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-purple-300 to-transparent rounded-full opacity-60" />
      </div>

      {/* Admin Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="zen-text-gradient text-2xl font-semibold mb-3">Tim Admin</h2>
            <p className="text-slate-600 text-base">
              Tim inti yang menjaga komunitas tetap aktif dan terarah
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="stagger-item"
                onMouseEnter={() => setHoveredMember(admin.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <MemberCard name={admin.name} isAdmin={true} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-20 flex items-center justify-center">
        <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-purple-200 to-transparent rounded-full opacity-50" />
      </div>

      {/* Member Section */}
      <section id="members" className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="zen-text-gradient text-2xl font-semibold mb-3">Member Komunitas</h2>
            <p className="text-slate-600 text-base">
              {members.length}+ member aktif yang berbagi passion anime
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="stagger-item"
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <MemberCard
                  name={member.name}
                  isAdmin={false}
                  loading={index < 8 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container text-center space-y-8">
          <h2 className="zen-text-gradient text-2xl md:text-3xl font-semibold">
            Siap Bergabung?
          </h2>

          <p className="text-slate-600 max-w-xl mx-auto">
            Bergabung dengan komunitas anime aktif, temukan teman baru,
            dan nikmati diskusi yang lebih hidup setiap hari.
          </p>

          <a
            href={communityStats.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transition-all duration-300"
          >
            <Send size={20} />
            Bergabung di Telegram
          </a>
        </div>
      </section>

      {/* Footer */}
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
                <li>Dibuat: {communityStats.foundedDate}</li>
                <li>Member: {communityStats.totalMembers}</li>
                <li>Chat/Hari: {communityStats.chatPerDay}</li>
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
            <p>© 2020-{new Date().getFullYear()} Anime Lovers Indo.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
