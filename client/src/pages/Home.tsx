import React, { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { MemberCard } from '@/components/MemberCard';
import { StatCard } from '@/components/StatCard';
import { admins, members, communityStats } from '@/lib/communityData';
import { Send, Users, MessageCircle, Calendar } from 'lucide-react';

export default function Home() {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  return (
    <div className="min-h-screen zen-gradient">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-lg zen-text-gradient">ANILO</span>
          </div>
          <a
            href={communityStats.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Send size={18} />
            Bergabung
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663538373418/o2Sxqbrf6ZggVrqi6x4Wgv/hero-bg-zen-jiSuVL3UYYt9jqN232Ru7z.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white" />

        <div className="container relative z-10 text-center space-y-8">
          <div className="space-y-4 fade-in-up">
            <h1 className="zen-text-gradient">
              Anime Lovers Indo
            </h1>
            <p className="text-2xl md:text-3xl font-light text-slate-600">
              Komunitas Anime Terbesar di Telegram
            </p>
          </div>

          <div className="flex justify-center fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-6xl font-bold zen-text-gradient">ANILO</div>
          </div>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed fade-in-up" style={{ animationDelay: '0.3s' }}>
            Tempat berkumpulnya para pecinta anime di Indonesia. Diskusi seru, berbagi rekomendasi, dan membangun komunitas yang solid.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 fade-in-up" style={{ animationDelay: '0.4s' }}>
            <a
              href={communityStats.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Bergabung Sekarang
            </a>
            <a
              href="#members"
              className="px-8 py-4 rounded-full bg-white border-2 border-purple-200 text-purple-600 font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Users size={20} />
              Lihat Member
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stagger-item">
              <StatCard
                label="Total Member"
                value={communityStats.totalMembers}
                icon="👥"
              />
            </div>
            <div className="stagger-item">
              <StatCard
                label="Chat Per Hari"
                value={communityStats.chatPerDay}
                icon="💬"
              />
            </div>
            <div className="stagger-item">
              <StatCard
                label="Dibuat Sejak"
                value="2020"
                icon="📅"
              />
            </div>
            <div className="stagger-item">
              <StatCard
                label="Status"
                value="Aktif"
                icon="✨"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-24 flex items-center justify-center">
        <div
          className="w-32 h-32 opacity-30"
          style={{
            backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663538373418/o2Sxqbrf6ZggVrqi6x4Wgv/anime-accent-element-ajYxs7DciRqpnWrxCusq3x.webp)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Admin Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="zen-text-gradient mb-4">Tim Admin</h2>
            <p className="text-slate-600 text-lg">
              Mereka yang menjaga komunitas tetap harmonis dan berkembang
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {admins.map((admin, index) => (
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
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent rounded-full" />
      </div>

      {/* Member Section */}
      <section id="members" className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="zen-text-gradient mb-4">Member Komunitas</h2>
            <p className="text-slate-600 text-lg">
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
          <div>
            <h2 className="zen-text-gradient mb-4">Siap Bergabung?</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Jangan lewatkan kesempatan untuk menjadi bagian dari komunitas anime terbesar di Indonesia. Diskusi seru, teman baru, dan pengalaman yang tak terlupakan menanti Anda.
            </p>
          </div>

          <a
            href={communityStats.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Send size={24} />
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
