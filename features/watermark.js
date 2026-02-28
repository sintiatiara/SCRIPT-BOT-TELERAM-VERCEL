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
        "Halo 💛\nSet watermark dulu ya.\nAtur posisi, mode dan opacity.",
        keyboard
      );
    });

    // MENU BUTTON
    bot.on("message", async (msg) => {
      const uid = msg.from.id;
      const text = msg.text;
      if (!text) return;

      if (text === "🖼 Set Watermark") {
        waitingWatermark.add(uid);
        return bot.sendMessage(msg.chat.id, "Kirim foto watermark sekarang 🖼");
      }

      if (text.includes("Kiri")) {
        userPosition[uid] = "kiri";
        return bot.sendMessage(msg.chat.id, "Posisi: kiri ✅");
      }

      if (text.includes("Tengah")) {
        userPosition[uid] = "tengah";
        return bot.sendMessage(msg.chat.id, "Posisi: tengah ✅");
      }

      if (text.includes("Kanan")) {
        userPosition[uid] = "kanan";
        return bot.sendMessage(msg.chat.id, "Posisi: kanan ✅");
      }

      if (text.includes("Single")) {
        userMode[uid] = "single";
        return bot.sendMessage(msg.chat.id, "Mode: single ✅");
      }

      if (text.includes("Grid")) {
        userMode[uid] = "grid";
        return bot.sendMessage(msg.chat.id, "Mode: grid ✅");
      }

      if (text.includes("30%")) {
        userOpacity[uid] = 0.3;
        return bot.sendMessage(msg.chat.id, "Opacity: 30% ✅");
      }

      if (text.includes("50%")) {
        userOpacity[uid] = 0.5;
        return bot.sendMessage(msg.chat.id, "Opacity: 50% ✅");
      }

      if (text.includes("100%")) {
        userOpacity[uid] = 1.0;
        return bot.sendMessage(msg.chat.id, "Opacity: 100% ✅");
      }

      if (text === "ℹ️ Bantuan") {
        return bot.sendMessage(
          msg.chat.id,
          "Cara pakai:\n" +
          "1️⃣ Klik Set Watermark\n" +
          "2️⃣ Kirim logo watermark\n" +
          "3️⃣ Pilih Mode\n" +
          "4️⃣ Pilih Opacity\n" +
          "5️⃣ Kirim Foto testimoni\n"
        );
      }
    });

    // HANDLE PHOTO
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

          return bot.sendMessage(
            chatId,
            "✅ Watermark berhasil disimpan!\n\n" +
            "Sekarang pilih pengaturan lalu kirim foto 💛",
            keyboard
          );
        }

        if (!userWatermark[uid]) {
          return bot.sendMessage(chatId, "Set watermark dulu ❗");
        }

        await bot.sendMessage(chatId, "⏳ Memproses...");

        const baseImage = sharp(inputBuffer);
        const metadata = await baseImage.metadata();

        const wmWidth = Math.floor(metadata.width * 0.3);

        const wmResized = await sharp(userWatermark[uid])
          .resize({ width: wmWidth })
          .png()
          .toBuffer();

        const opacity = userOpacity[uid] || 0.3;

        // ================= GRID MODE =================
        if (userMode[uid] === "grid") {

          const compositeArray = [];
          const wmMeta = await sharp(wmResized).metadata();

          const spacingX = Math.floor(wmMeta.width * 1.4);
          const spacingY = Math.floor(wmMeta.height * 1.4);

          for (let y = 0; y < metadata.height; y += spacingY) {
            for (let x = 0; x < metadata.width; x += spacingX) {
              compositeArray.push({
                input: wmResized,
                top: y,
                left: x,
                blend: "over",
                opacity: opacity
              });
            }
          }

          const finalImage = await baseImage
            .composite(compositeArray)
            .png()
            .toBuffer();

          if (!finalImage) {
            return bot.sendMessage(chatId, "Gagal generate gambar ❌");
          }

          return bot.sendPhoto(chatId, {
            source: finalImage,
            filename: "watermark.png"
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
          .png()
          .toBuffer();

        if (!finalImage) {
          return bot.sendMessage(chatId, "Gagal generate gambar ❌");
        }

        return bot.sendPhoto(chatId, {
          source: finalImage,
          filename: "watermark.png"
        });

      } catch (error) {
        console.error("ERROR WATERMARK:", error);
        return bot.sendMessage(chatId, "Terjadi kesalahan saat memproses gambar ❌");
      }
    });

  }
};
