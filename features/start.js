module.exports = {
  command: 'start',
  description: 'Mulai bot watermark',

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name;

    const welcomeMsg = `
👋 Halo ${name}!

Selamat datang di Bot Watermark.

📌 Cara pakai:
Kirim foto yang ingin kamu beri watermark.
Bot akan otomatis memproses dan mengirim kembali hasilnya.

Ketik /help jika butuh bantuan.
    `.trim();

    try {
      await bot.sendMessage(chatId, welcomeMsg, {
        reply_to_message_id: msg.message_id
      });

      console.log(`[LOG] /start executed`);
    } catch (error) {
      console.error(`[ERROR] /start: ${error.message}`);
    }
  }
};
