const sharp = require("sharp");
const axios = require("axios");

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

    // START
    bot.onText(/\/start/, async (msg) => {
      const uid = msg.from.id;
      userPosition[uid] = "kanan";
      userMode[uid] = "single";
      userOpacity[uid] = 0.3;

      await bot.sendMessage(
        msg.chat.id,
        "Halo 💛\nSet watermark dulu ya.",
        keyboard
      );
    });

    // MENU
    bot.on("message", async (msg) => {
      if (!msg.text) return;

      const uid = msg.from.id;
      const text = msg.text;

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
        return bot.sendMessage(
          msg.chat.id,
          "1️⃣ Set watermark\n2️⃣ Pilih mode\n3️⃣ Kirim foto"
        );
      }
    });

    // PHOTO
    bot.on("photo", async (msg) => {
      const uid = msg.from.id;
      const chatId = msg.chat.id;

      try {

        const photo = msg.photo[msg.photo.length - 1];
        const file = await bot.getFile(photo.file_id);

        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        const response = await axios.get(fileUrl, {
          responseType: "arraybuffer"
        });

        const inputBuffer = Buffer.from(response.data);

        // SIMPAN WATERMARK
        if (waitingWatermark.has(uid)) {
          userWatermark[uid] = inputBuffer;
          waitingWatermark.delete(uid);
          return bot.sendMessage(chatId, "✅ Watermark disimpan!");
        }

        if (!userWatermark[uid]) {
          return bot.sendMessage(chatId, "Set watermark dulu ❗");
        }

        await bot.sendMessage(chatId, "⏳ Memproses...");

        // 🔥 RESIZE AGAR CEPAT
        const baseImage = sharp(inputBuffer).resize({
          width: 1080,
          withoutEnlargement: true
        });

        const metadata = await baseImage.metadata();
        const wmWidth = Math.floor(metadata.width * 0.25);

        const wmResized = await sharp(userWatermark[uid])
          .resize({ width: wmWidth })
          .png()
          .toBuffer();

        const opacity = userOpacity[uid] || 0.3;

        // ================= GRID MODE =================
        if (userMode[uid] === "grid") {

          const compositeArray = [];
          const wmMeta = await sharp(wmResized).metadata();

          const spacingX = Math.floor(wmMeta.width * 1.5);
          const spacingY = Math.floor(wmMeta.height * 1.5);

          let count = 0;

          for (let y = 0; y < metadata.height; y += spacingY) {
            for (let x = 0; x < metadata.width; x += spacingX) {

              if (count > 40) break; // 🔥 BATAS GRID

              compositeArray.push({
                input: wmResized,
                top: y,
                left: x,
                blend: "over",
                opacity: opacity
              });

              count++;
            }
          }

          const finalImage = await baseImage
            .composite(compositeArray)
            .jpeg({ quality: 90 }) // 🔥 LEBIH CEPAT DARI PNG
            .toBuffer();

          return bot.sendPhoto(chatId, {
            source: finalImage,
            filename: "watermark.jpg"
          });
        }

        // ================= SINGLE MODE =================

        const gravity =
          userPosition[uid] === "kiri"
            ? "west"
            : userPosition[uid] === "tengah"
            ? "center"
            : "east";

        const finalImage = await baseImage
          .composite([
            {
              input: wmResized,
              gravity: gravity,
              blend: "over",
              opacity: opacity
            }
          ])
          .jpeg({ quality: 90 }) // 🔥 LEBIH CEPAT
          .toBuffer();

        return bot.sendPhoto(chatId, {
          source: finalImage,
          filename: "watermark.jpg"
        });

      } catch (error) {
        console.error("ERROR:", error);
        return bot.sendMessage(chatId, "❌ Gagal memproses gambar");
      }
    });

  }
};
