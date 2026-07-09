# Discord Media Downloader Bot

Bot Discord untuk mendownload video/audio dari berbagai platform sosial media menggunakan slash command `/download`.

## Fitur

- Support **TikTok, Instagram, YouTube, Facebook, Twitter/X, CapCut, Google Drive, Spotify, SoundCloud, Threads**, dan lainnya
- Auto-detect platform dari URL
- Hasil ditampilkan dalam **Embed** yang rapi
- Command `/download` — tinggal ketik, gak perlu tag bot
- Command langsung aktif di server baru (gak perlu nunggu 1 jam)

## Platform yang Didukung

| Platform | Contoh Link |
|---|---|
| TikTok | `https://www.tiktok.com/@user/video/123` |
| Instagram | `https://www.instagram.com/reel/xxx/` |
| YouTube | `https://youtu.be/xxx` atau `https://youtube.com/watch?v=xxx` |
| Facebook | `https://www.facebook.com/watch/?v=xxx` |
| Twitter / X | `https://twitter.com/user/status/xxx` |
| CapCut | `https://www.capcut.com/template-detail/xxx` |
| Google Drive | `https://drive.google.com/file/d/xxx` |
| Spotify | `https://open.spotify.com/track/xxx` |
| SoundCloud | `https://soundcloud.com/user/title` |
| Threads | `https://www.threads.net/@user/post/xxx` |

## Prerequisites

- **Node.js** v20+
- **npm** (sudah termasuk Node.js)
- Discord Bot Token (dari [Discord Developer Portal](https://discord.com/developers/applications))

## Cara Install

### 1. Clone atau download project

```bash
git clone <url-repo>
cd DiscordBotDownloader
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup token

Buat file `.env` di root folder (sudah tersedia):

```
DISCORD_TOKEN=isi_token_disini
```

Ganti `isi_token_disini` dengan token bot dari Discord Developer Portal.

### 4. Jalankan bot

```bash
npm start
```

Bot akan online dan command `/download` langsung terdaftar di server.

## Cara Pakai

Di channel Discord, ketik slash command:

```
/download url:https://www.tiktok.com/@user/video/7025456384175017243
```

Bot akan otomatis menampilkan link download dalam bentuk Embed.

## Cara Mendapatkan Token & Invite Bot

1. Buka https://discord.com/developers/applications
2. Klik **New Application** → beri nama → **Create**
3. Tab **Bot** → **Add Bot** → **Reset Token** → copy token
4. Tab **OAuth2 > URL Generator**:
   - Scope: `bot` + `applications.commands`
   - Permissions: `Send Messages`, `Read Message History`, `Attach Files`
5. Buka URL yang di-generate, pilih server

> **Catatan**: Scope `applications.commands` wajib agar slash command `/download` bisa muncul.

## Deploy ke VPS (Production)

Disarankan menggunakan **PM2** untuk menjaga bot tetap hidup:

```bash
npm install -g pm2
pm2 start index.js --name discord-bot
pm2 save
pm2 startup
```

## Teknologi

- [discord.js](https://discord.js.org/)
- [btch-downloader](https://www.npmjs.com/package/btch-downloader)
