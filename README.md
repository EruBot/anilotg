# Anime Lovers Indo (ANILO)

Landing page modern untuk komunitas Telegram **Anime Lovers Indo** - komunitas anime terbesar di Indonesia.

## 🎨 Desain

Menggunakan **Minimalist Zen Anime Aesthetic** dengan:
- Soft color palette (purple, pink, white)
- Generous whitespace dan elegant typography
- Smooth animations dan subtle interactions
- Japanese-inspired minimalist elements
- Responsive design untuk semua device

## 📊 Fitur

- **Hero Section**: Presentasi komunitas yang elegan
- **Statistics**: Menampilkan 15k+ member, 20k chat/hari, dibuat 29 Oktober 2020
- **Admin Section**: Menampilkan 15 admin dengan avatar unik dari DiceBear API
- **Member Section**: Menampilkan 50+ member dengan avatar dan nama
- **CTA Section**: Call-to-action untuk bergabung dengan komunitas
- **Responsive Design**: Optimal di mobile, tablet, dan desktop

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + Custom CSS
- **Icons**: Lucide React
- **Avatar Generator**: DiceBear API (Anime style)
- **Fonts**: Playfair Display (headings) + Poppins (body)
- **Build**: Vite
- **Deployment**: GitHub Pages

## 📦 Instalasi & Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

Website di-deploy otomatis ke GitHub Pages menggunakan GitHub Actions.

### Custom Domain Setup

Domain: `jksubindo.eu.org`

**DNS Records (Hostry eu.org):**
```
Type: A
Name: jksubindo
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153

Type: AAAA
Name: jksubindo
Value: 2606:50c0:8000::153
       2606:50c0:8001::153
       2606:50c0:8002::153
       2606:50c0:8003::153
```

## 📁 Struktur Proyek

```
anilotg/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar.tsx          # Avatar component dengan DiceBear API
│   │   │   ├── MemberCard.tsx      # Card untuk member/admin
│   │   │   └── StatCard.tsx        # Card untuk statistik
│   │   ├── lib/
│   │   │   └── communityData.ts    # Data admin dan member
│   │   ├── pages/
│   │   │   └── Home.tsx            # Landing page utama
│   │   ├── App.tsx                 # Root component
│   │   └── index.css               # Global styles & theme
│   ├── index.html
│   └── public/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions workflow
├── package.json
└── README.md
```

## 👥 Komunitas

- **Nama**: Anime Lovers Indo (ANILO)
- **Total Member**: 15k+
- **Chat Per Hari**: 20k
- **Dibuat**: 29 Oktober 2020
- **Link Telegram**: https://t.me/grup_anime_indo

## 📝 Lisensi

MIT License

## 🎯 Admin

Tim admin yang mengelola komunitas:
- erruuu
- youttaa
- gaesaekkiyashibal
- ohhaewonniez
- aetyphia
- DainsleifRil
- Absrdd1
- jabami_yumekoo_chan
- cigarliaox
- ninomataa
- yoo nichol.
- c
- Light_ill
- evellmaoi
- Anomaliii

---

Dibuat dengan ❤️ untuk komunitas anime Indonesia
