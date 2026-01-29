const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const features = require('../features');
const app = express();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.BOT_USERNAME || 'Danxyy_bot';

if (!BOT_TOKEN) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN not found in environment variables!');
}

const bot = new TelegramBot(BOT_TOKEN, {
  polling: false 
});

features.register(bot);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/bot', async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    res.status(200).send('OK');
  } catch (error) {
    res.status(200).send('OK'); 
  }
});

app.get('/set-webhook', async (req, res) => {
  try {
    const vercelUrl = 'https://script-bot-teleram-vercel.vercel.app';
    const webhookUrl = `${vercelUrl}/api/bot`;
    
    await bot.deleteWebHook();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await bot.setWebHook(webhookUrl);
    
    const botInfo = await bot.getMe();
    const webhookInfo = await bot.getWebHookInfo();
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link id="icon" rel="icon" href="https://uploader.zenzxz.dpdns.org/uploads/1761921604349.png" type="image/png">
        <title>Server Webhook Status</title>
        <style>
          :root {
            --bg: #0f172a;
            --card-bg: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #38bdf8;
            --success: #22c55e;
          }
          body { 
            font-family: 'Inter', -apple-system, sans-serif; 
            background-color: var(--bg); 
            color: var(--text-primary);
            padding: 40px 20px; 
            max-width: 600px; 
            margin: 0 auto; 
            line-height: 1.6;
          }
          h1 { color: var(--success); font-size: 24px; margin-bottom: 30px; border-left: 4px solid var(--success); padding-left: 15px; }
          .card { 
            background: var(--card-bg); 
            padding: 25px; 
            border-radius: 12px; 
            margin: 20px 0; 
            border: 1px solid rgba(255,255,255,0.05);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          h3 { color: var(--accent); margin-top: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; }
          p { margin: 10px 0; color: var(--text-secondary); font-size: 14px; }
          strong { color: var(--text-primary); }
          code { background: #000; padding: 2px 6px; border-radius: 4px; color: var(--accent); }
          .btn { 
            display: inline-block; 
            padding: 12px 24px; 
            background: var(--accent); 
            color: #000; 
            text-decoration: none; 
            border-radius: 8px; 
            margin-right: 10px;
            font-weight: 600;
            font-size: 14px;
            transition: opacity 0.2s;
          }
          .btn-secondary { background: transparent; color: var(--text-primary); border: 1px solid var(--text-secondary); }
          .btn:hover { opacity: 0.8; }
          ol { padding-left: 20px; color: var(--text-secondary); font-size: 14px; }
          ol li { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <h1>Webhook Configuration Complete</h1>
        
        <div class="card">
          <h3>System Identity</h3>
          <p><strong>Name:</strong> ${botInfo.first_name}</p>
          <p><strong>Username:</strong> @${botInfo.username}</p>
          <p><strong>Identification:</strong> ${botInfo.id}</p>
        </div>
        
        <div class="card">
          <h3>Network Details</h3>
          <p><strong>Endpoint:</strong> ${webhookUrl}</p>
          <p><strong>Status:</strong> ${webhookInfo.url ? 'Connected' : 'Disconnected'}</p>
          <p><strong>Queue:</strong> ${webhookInfo.pending_update_count} updates</p>
        </div>
        
        <div class="card">
          <h3>Initialization</h3>
          <ol>
            <li>Access Telegram application</li>
            <li>Locate <strong>@${botInfo.username}</strong></li>
            <li>Execute <code>/start</code> command</li>
            <li>System response will trigger immediately</li>
          </ol>
        </div>
        
        <div style="margin-top: 30px;">
          <a class="btn" href="https://t.me/${botInfo.username}">Open Terminal</a>
          <a class="btn btn-secondary" href="/">Dashboard</a>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    res.status(500).send(`
      <body style="background:#0f172a; color:#ef4444; font-family:sans-serif; padding:40px;">
        <h1>Configuration Failed</h1>
        <p style="color:#94a3b8">Error details: ${error.message}</p>
      </body>
    `);
  }
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Bot Control Panel</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link id="icon" rel="icon" href="https://uploader.zenzxz.dpdns.org/uploads/1761921604349.png" type="image/png">
      <style>
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: #020617;
          min-height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #f8fafc;
        }
        .container {
          background: #0f172a;
          border-radius: 24px;
          padding: 60px 40px;
          max-width: 440px;
          width: 90%;
          border: 1px solid rgba(255,255,255,0.05);
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; letter-spacing: -1px; }
        .description { color: #94a3b8; font-size: 15px; margin-bottom: 32px; }
        .status-pill {
          display: inline-flex;
          align-items: center;
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 32px;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          margin-right: 10px;
          box-shadow: 0 0 10px #22c55e;
        }
        .btn-group { display: flex; flex-direction: column; gap: 12px; }
        .btn {
          padding: 16px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s;
        }
        .btn-primary { background: #38bdf8; color: #020617; }
        .btn-secondary { background: #1e293b; color: #f8fafc; border: 1px solid rgba(255,255,255,0.1); }
        .btn:hover { transform: translateY(-2px); opacity: 0.9; }
        
        .command-box {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .command {
          background: #1e293b;
          padding: 6px 12px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.2);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Telegram Instance</h1>
        <div class="status-pill">
          <div class="status-dot"></div>
          <span>Service Operational</span>
        </div>
        
        <p class="description">Serverless bot architecture deployed via Vercel Edge Runtime.</p>
        
        <div class="btn-group">
          <a href="/set-webhook" class="btn btn-primary">Establish Webhook</a>
          <a href="https://t.me/Danxyy_bot" class="btn btn-secondary" target="_blank">Access Interface</a>
        </div>
        
        <div class="command-box">
          <div class="command">/start</div>
        </div>
      </div>
    </body>
    </html>
  `);
});

module.exports = app;
