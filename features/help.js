module.exports = {
  command: 'help',
  description: 'Panduan penggunaan bot',

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;

    const helpMsg = `
📌 PANDUAN BOT WATERMARK

1️⃣ Kirim foto ke bot
2️⃣ Tunggu beberapa detik
3️⃣ Bot akan mengirim foto yang sudah diberi watermark

Command tersedia:
/start - Mulai bot
/help - Lihat panduan

Selesai ✅
    `.trim();

    try {
      await bot.sendMessage(chatId, helpMsg, {
        reply_to_message_id: msg.message_id
      });

      console.log(`[LOG] /help executed`);
    } catch (error) {
      console.error(`[ERROR] /help: ${error.message}`);
    }
  }
};
