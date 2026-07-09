import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { igdl, ttdl, fbdown, twitter, youtube, capcut, gdrive, spotify, soundcloud, threads } from 'btch-downloader';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
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

function extractLinks(result) {
  const links = [];
  if (typeof result === 'string') {
    links.push(result);
  } else if (typeof result === 'object') {
    const seen = new Set();
    const add = (url) => { if (url && !seen.has(url)) { seen.add(url); links.push(url); } };
    if (result.mp4) add(result.mp4);
    if (result.video) add(result.video);
    if (result.mp3) add(result.mp3);
    if (result.url) add(result.url);
    if (result.data?.url) add(result.data.url);
    if (Array.isArray(result)) result.forEach(r => { if (r.url) add(r.url); if (r.video) add(r.video); });
    if (Array.isArray(result.result)) result.result.forEach(r => { if (r.url) add(r.url); if (r.video) add(r.video); });
  }
  return links;
}

async function handleDownload(interaction) {
  const url = extractUrl(interaction.options.getString('url'));
  if (!url) {
    return interaction.editReply('⚠️ URL tidak valid.');
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return interaction.editReply('⚠️ Platform tidak didukung atau URL tidak dikenal.');
  }

  await interaction.editReply(`🔍 Mendeteksi **${platform.name}**...`);

  try {
    const result = await platform.fn(url);
    const links = extractLinks(result);

    if (links.length > 0) {
      const embed = new EmbedBuilder()
        .setTitle(result.title || platform.name)
        .setColor(0x5865F2);

      if (result.author) embed.setAuthor({ name: result.author });

      const desc = links.map((link, i) => {
        const label = links.length > 1 ? `Download ${i + 1}` : `Download Video`;
        return `[${label}](${link})`;
      }).join(' | ');
      embed.setDescription(desc);

      if (result.mp3 && !links.includes(result.mp3)) {
        embed.addFields({ name: '🎵 Audio', value: `[Download MP3](${result.mp3})` });
      }

      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply(`⚠️ Gagal mendapatkan link download. Response:\n\`\`\`json\n${JSON.stringify(result, null, 2).slice(0, 500)}\n\`\`\``);
    }
  } catch (err) {
    await interaction.editReply(`❌ Gagal mendownload: ${err.message}`);
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'download') return;

  await interaction.deferReply();
  await handleDownload(interaction);
});

const commandData = new SlashCommandBuilder()
  .setName('download')
  .setDescription('Download video/audio dari link sosial media')
  .addStringOption(option =>
    option.setName('url')
      .setDescription('Link TikTok, Instagram, YouTube, dll')
      .setRequired(true)
  ).toJSON();

async function registerCommands(guildId) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: [commandData] }
    );
    console.log(`✅ Command /download terdaftar di guild ${guildId}`);
  } catch (err) {
    console.error(`❌ Gagal daftarin command di guild ${guildId}: ${err.message}`);
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot ${client.user.tag} sudah online!`);
  for (const guild of client.guilds.cache.values()) {
    await registerCommands(guild.id);
  }
});

client.on('guildCreate', async (guild) => {
  await registerCommands(guild.id);
});

client.login(process.env.DISCORD_TOKEN);
