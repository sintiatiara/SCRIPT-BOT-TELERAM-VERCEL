module.exports = {
  command: 'start',
  description: 'Start the bot and show welcome message',

  execute: async (bot, msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name;
    const userId = msg.from.id;

    const gifUrl = 'https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUydHpzczkxejN5NGpkdDc5M3h6cXA3OWR6MTlocW12emF1MG5zZGQ5dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MqlVfYDenvazq5MgeK/giphy.gif';
    const audioUrl = 'https://danxyofficial.edgeone.app/ssstik.io_1769391024921.mp3';

    const welcomeMsg = `
*DANXY INTELLIGENCE SYSTEM*
*Halo ${name},*

*Daftar Perintah Sistem:*
- /start : Inisialisasi layanan
- /help : Panduan sistem
- /ai : Danxy-AI

*Informasi Arsitektur:*
- Deployment: Vercel Edge Layer
- Status: Terverifikasi
---------------------------------------
*ID UNIT:* \`${userId}\`
*STATUS:* \`ONLINE\`
    `.trim();

    bot.sendChatAction(chatId, 'typing').catch(() => {});

    try {
      
      const sendMainInterface = bot.sendAnimation(chatId, gifUrl, {
        caption: welcomeMsg,
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Web Developer', url: 'https://danxyofficial.zapto.org' }]
          ]
        }
      });

      const sendVoiceNote = bot.sendVoice(chatId, audioUrl, {
        disable_notification: true,
        reply_to_message_id: msg.message_id
      });

      await Promise.all([
        sendMainInterface.catch(err => console.error('[GIF_FAIL]', err.message)),
        sendVoiceNote.catch(err => console.error('[VOICE_FAIL]', err.message))
      ]);

      console.log(`[FAST-LOG] /start sent to ${name}`);
    } catch (error) {
      console.error(`[CRITICAL] /start: ${error.message}`);
      await bot.sendMessage(chatId, welcomeMsg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Web Developer', url: 'https://danxyofficial.zapto.org' }]]
        }
      });
    }
  }
};
