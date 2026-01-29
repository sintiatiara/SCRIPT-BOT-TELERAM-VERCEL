module.exports = {
  command: 'help',
  description: 'Menampilkan informasi panduan sistem',

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const helpMsg = `
*PANDUAN OPERASIONAL SISTEM*
---------------------------------------
*Daftar Instruksi Tersedia:*

1. /start
Menginisialisasi ulang sesi dan menjalankan protokol penyambutan sistem.

2. /help
Menampilkan dokumentasi bantuan dan prosedur operasional ini.

3. /ping
Melakukan uji latensi antara server Telegram dan infrastruktur Vercel.

*Prosedur Penggunaan:*
- Kirimkan salah satu instruksi di atas melalui kolom input pesan.
- Sistem akan memproses permintaan secara otomatis melalui Edge Network.
- Pastikan status sesi Anda dalam keadaan aktif.

*Pusat Bantuan Teknik:*
Jika sistem tidak memberikan respon dalam 5 detik, harap periksa status konektivitas Anda atau hubungi administrator melalui jalur resmi yang tersedia.
---------------------------------------
*LOG_ID:* \`${userId}\`
*STATUS:* \`SYSTEM_READY\`
    `.trim();

    try {
      bot.sendChatAction(chatId, 'typing').catch(() => {});

      await bot.sendMessage(chatId, helpMsg, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Hubungi Administrator', url: 'https://danxyofficial.zapto.org' }
            ]
          ]
        }
      });

      console.log(`[FAST-LOG] /help executed for ID: ${userId}`);
    } catch (error) {
      console.error(`[ERROR] /help failed: ${error.message}`);
      
      await bot.sendMessage(chatId, "Terjadi kesalahan teknis saat memuat panduan sistem.");
    }
  }
};
