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
  console.log('🔧 Registering features...');

  Object.entries(features).forEach(([name, feature]) => {

    // 🔹 Register command
    if (feature.command) {
      const pattern = new RegExp(`^\\/${feature.command}(?:@\\w+)?$`);
      
      bot.onText(pattern, (msg) => {
        console.log(`Command /${feature.command} from ${msg.from.id}`);
        feature.execute(bot, msg);
      });

      console.log(`   ↳ Command: /${feature.command}`);
    }

    // 🔹 Register custom handler (INI YANG PENTING)
    if (typeof feature.register === 'function') {
      feature.register(bot);
      console.log(`   ↳ Custom handler registered: ${name}`);
    }

  });

  console.log(`Total features: ${Object.keys(features).length}`);
}

module.exports = {
  ...features,
  register
};
