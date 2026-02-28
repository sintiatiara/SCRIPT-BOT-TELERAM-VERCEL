const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const userPosition = {};
const userMode = {};
const userOpacity = {};
const userWatermark = {};
const waitingWatermark = new Set();

module.exports = {
  register(bot) {

    const keyboard = {
      reply_markup: {
        keyboard: [
          ["🖼 Set Watermark"],
          ["⬅️ Kiri", "🔲 Tengah", "➡️ Kanan"],
          ["🧩 Single Mode", "🔲 Grid Mode"],
          ["🔳 Opacity 30%", "🔳 Opacity 50%", "🔳 Opacity 100%"],
          ["ℹ️ Bantuan"]
        ],
        resize_keyboard: true
      }
    };

    bot.onText(/\/start/, async (msg) => {
      const uid = msg.from.id;
      userPosition[uid] = "kanan";
      userMode[uid] = "single";
      userOpacity[uid] = 0.3;

      bot.sendMessage(msg.chat.id,
        "Halo 💛\nSet watermark dulu ya.\nAtur posisi & opacity.",
        keyboard
      );
    });

    bot.on("message", async (msg) => {
      const uid = msg.from.id;
      const text = msg.text;
      if (!text) return;

      if (text === "🖼 Set Watermark") {
        waitingWatermark.add(uid);
        return bot.sendMessage(msg.chat.id, "Kirim foto watermark sekarang 🖼");
      }

      if (text.includes("Kiri")) userPosition[uid] = "kiri";
      if (text.includes("Tengah")) userPosition[uid] = "tengah";
      if (text.includes("Kanan")) userPosition[uid] = "kanan";

      if (text.includes("Single")) userMode[uid] = "single";
      if (text.includes("Grid")) userMode[uid] = "grid";

      if (text.includes("30%")) userOpacity[uid] = 0.3;
      if (text.includes("50%")) userOpacity[uid] = 0.5;
      if (text.includes("100%")) userOpacity[uid] = 1.0;

      if (text === "ℹ️ Bantuan") {
        return bot.sendMessage(msg.chat.id,
          "1️⃣ Set Watermark\n2️⃣ Pilih Mode\n3️⃣ Atur Opacity\n4️⃣ Kirim Foto"
        );
      }
    });

    bot.on("photo", async (msg) => {
      const uid = msg.from.id;
      const chatId = msg.chat.id;

      const photo = msg.photo[msg.photo.length - 1];
      const file = await bot.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

      if (waitingWatermark.has(uid)) {
        const res = await fetch(fileUrl);
        const buffer = await res.buffer();
        const wmPath = path.join(__dirname, `wm_${uid}.png`);
        fs.writeFileSync(wmPath, buffer);
        userWatermark[uid] = wmPath;
        waitingWatermark.delete(uid);
        return bot.sendMessage(chatId, "Watermark disimpan ✅");
      }

      if (!userWatermark[uid]) {
        return bot.sendMessage(chatId, "Set watermark dulu ❗");
      }

      const baseImg = await loadImage(fileUrl);
      const wmImg = await loadImage(userWatermark[uid]);

      const canvas = createCanvas(baseImg.width, baseImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImg, 0, 0);

      const newW = baseImg.width * 0.3;
      const ratio = newW / wmImg.width;
      const newH = wmImg.height * ratio;

      ctx.globalAlpha = userOpacity[uid] || 0.3;

      if (userMode[uid] === "grid") {
        for (let y = 0; y < baseImg.height; y += newH * 1.4) {
          for (let x = 0; x < baseImg.width; x += newW * 1.4) {
            ctx.drawImage(wmImg, x, y, newW, newH);
          }
        }
      } else {
        let x = baseImg.width - newW - 20;
        let y = (baseImg.height - newH) / 2;

        if (userPosition[uid] === "kiri") x = 20;
        if (userPosition[uid] === "tengah") x = (baseImg.width - newW) / 2;

        ctx.drawImage(wmImg, x, y, newW, newH);
      }

      const buffer = canvas.toBuffer("image/png");
      await bot.sendPhoto(chatId, buffer);
    });

  }
};
