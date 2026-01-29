const fs = require('fs');
const path = require('path');

const features = {};

const files = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

files.forEach(file => {
  const featureName = path.basename(file, '.js');
  try {
    features[featureName] = require(`./${file}`);
    console.log(`Loaded feature: ${featureName}`);
  } catch (error) {
    console.error(`Error loading ${file}:`, error.message);
  }
});

function register(bot) {
  console.log('🔧 Registering commands...');
  
  Object.entries(features).forEach(([name, feature]) => {
    if (feature.command) {
      const pattern = new RegExp(`^\\/${feature.command}(?:@\\w+)?$`);
      
      bot.onText(pattern, (msg) => {
        console.log(`Command /${feature.command} from ${msg.from.id}`);
        feature.execute(bot, msg);
      });
      
      console.log(`   ↳ /${feature.command} - ${feature.description}`);
    }
  });
  
  bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/')) {
      const cmd = msg.text.split(' ')[0].replace('/', '');
      const knownCommands = Object.values(features)
        .map(f => f.command)
        .filter(c => c);
      
      if (!knownCommands.includes(cmd)) {
        bot.sendMessage(
          msg.chat.id,
          `Unknown command: /${cmd}\n\nUse /help for available commands.`
        );
        console.log(`Unknown command: /${cmd}`);
      }
    }
  });
  console.log(`Total commands: ${Object.keys(features).length}`);
}

module.exports = {
  ...features,
  register
};