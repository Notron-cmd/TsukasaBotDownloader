import { Client, GatewayIntentBits } from 'discord.js';
import { igdl, ttdl, fbdown, twitter, youtube, capcut, gdrive, spotify, soundcloud, threads } from 'btch-downloader';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const platformMap = [
  { name: 'Instagram', regex: /instagram\.com\/(p|reel|tv)\//i, fn: igdl },
  { name: 'TikTok', regex: /(tiktok\.com\/@[\w.-]+\/video\/\d+|vm\.tiktok\.com|vt\.tiktok\.com)/i, fn: ttdl },
  { name: 'Facebook', regex: /(facebook\.com\/watch\/?\?v=|fb\.watch\/)/i, fn: fbdown },
  { name: 'Twitter / X', regex: /(twitter\.com\/\w+\/status\/\d+|x\.com\/\w+\/status\/\d+)/i, fn: twitter },
  { name: 'YouTube', regex: /(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/i, fn: youtube },
  { name: 'CapCut', regex: /capcut\.com\/(template-detail\/\d+|t\/[\w-]+)/i, fn: capcut },
  { name: 'Google Drive', regex: /drive\.google\.com\/(file\/d\/|open\?id=)/i, fn: gdrive },
  { name: 'Spotify', regex: /open\.spotify\.com\/(track|album|playlist|episode)\//i, fn: spotify },
  { name: 'SoundCloud', regex: /soundcloud\.com\/[\w.-]+\/[\w.-]+/i, fn: soundcloud },
  { name: 'Threads', regex: /threads\.net\/@[\w.-]+\/post\//i, fn: threads },
];

function detectPlatform(text) {
  for (const p of platformMap) {
    if (p.regex.test(text)) return p;
  }
  return null;
}

function extractUrl(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const url = extractUrl(message.content);
  if (!url) return;

  const platform = detectPlatform(url);
  if (!platform) return;

  const reply = await message.reply(`🔍 Mendeteksi ${platform.name}...`);

  try {
    const result = await platform.fn(url);

    let downloadUrl = null;
    if (typeof result === 'object') {
      if (result.mp4) downloadUrl = result.mp4;
      else if (result.video) downloadUrl = result.video;
      else if (result.mp3) downloadUrl = result.mp3;
      else if (result.url) downloadUrl = result.url;
      else if (result.data?.url) downloadUrl = result.data.url;
      else if (Array.isArray(result) && result.length > 0) {
        downloadUrl = result[0].url || result[0].video || result[0];
      }
    } else if (typeof result === 'string') {
      downloadUrl = result;
    }

    if (downloadUrl) {
      const title = result.title || '';
      const author = result.author || '';
      let msg = `## 🎬 **${platform.name}**\n`;
      if (title) msg += `**${title}**\n`;
      if (author) msg += `👤 ${author}\n`;
      msg += `━━━━━━━━━━━━━━━\n🔗 **[Download Video](${downloadUrl})**`;
      if (result.mp3) msg += ` | 🎵 **[Download MP3](${result.mp3})**`;

      await reply.edit(msg);
    } else {
      await reply.edit(`⚠️ Gagal mendapatkan link download. Response:\n\`\`\`json\n${JSON.stringify(result, null, 2).slice(0, 500)}\n\`\`\``);
    }
  } catch (err) {
    await reply.edit(`❌ Gagal mendownload: ${err.message}`);
  }
});

client.once('ready', () => {
  console.log(`✅ Bot ${client.user.tag} sudah online!`);
});

client.login(process.env.DISCORD_TOKEN);
