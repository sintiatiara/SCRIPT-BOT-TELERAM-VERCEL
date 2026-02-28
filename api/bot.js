const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN not found!');
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

app.use(express.json());

/*
================================
LOGIC BOT WATERMARK
================================
*/

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(chatId, 
`👋 Halo!

Kirim gambar yang ingin kamu beri watermark.

Bot akan otomatis menambahkan watermark pada gambar kamu.`
  );
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(chatId,
`📌 Cara pakai:

1. Kirim foto
2. Tunggu proses
3. Bot akan kirim hasil watermark

Selesai ✅`
  );
});

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(chatId, "⏳ Sedang memproses...");

    const photo = msg.photo[msg.photo.length - 1];
    const file = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    const image = await loadImage(fileUrl);

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);

    // WATERMARK TEXT
    ctx.font = `${Math.floor(image.width / 20)}px Arial`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textAlign = "right";
    ctx.fillText("© Watermark Bot", image.width - 20, image.height - 20);

    const buffer = canvas.toBuffer();

    await bot.sendPhoto(chatId, buffer);

  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, "❌ Gagal memproses gambar.");
  }
});

/*
================================
WEBHOOK HANDLER
================================
*/

app.post('/api/bot', async (req, res) => {
  try {
    await bot.processUpdate(req.body);
  } catch (err) {
    console.error(err);
  }
  res.sendStatus(200);
});

/*
================================
SET WEBHOOK
================================
*/

app.get('/set-webhook', async (req, res) => {
  try {
    const vercelUrl = 'https://script-bot-teleram-vercel-dd93.vercel.app';
    const webhookUrl = `${vercelUrl}/api/bot`;

    await bot.deleteWebHook();
    await bot.setWebHook(webhookUrl);

    res.send("✅ Webhook berhasil di-set!");
  } catch (error) {
    res.status(500).send("❌ Gagal set webhook");
  }
});

app.get('/', (req, res) => {
  res.send("🚀 Bot Watermark Aktif");
});

module.exports = app;
