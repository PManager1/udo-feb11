// const fs = require('fs');
// const path = require('path');

// // Read .env file
// const envPath = path.join(__dirname, '../.env');
// const envContent = fs.readFileSync(envPath, 'utf8');

// // Parse GOOGLE_MAPS_API_KEY from .env
// const googleApiKeyMatch = envContent.match(/GOOGLE_MAPS_API_KEY=(.+)/);
// const googleApiKey = googleApiKeyMatch ? googleApiKeyMatch[1].trim() : 'YOUR_API_KEY_PLACEHOLDER';

// // Read config.js file
// const configPath = path.join(__dirname, '../public/assets/js/config.js');
// let configContent = fs.readFileSync(configPath, 'utf8');

// // Replace the placeholder with actual API key
// configContent = configContent.replace(
//   /const GOOGLE_MAPS_API_KEY = ['"].*?['"];/,
//   `const GOOGLE_MAPS_API_KEY = '${googleApiKey}';`
// );

// // Write back to config.js
// fs.writeFileSync(configPath, configContent, 'utf8');

// console.log('✅ Google Maps API key injected into config.js successfully!');


const fs = require('fs');
const path = require('path');

// 1. Try to get the key from the System Environment (Netlify)
// 2. If not found, try to find a .env file (Local)
let googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!googleApiKey) {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/GOOGLE_MAPS_API_KEY=(.+)/);
      if (match) googleApiKey = match[1].trim();
    }
  } catch (err) {
    console.log('⚠️ No .env file found, checking system variables...');
  }
}

// Fallback if still not found
if (!googleApiKey) {
  googleApiKey = 'YOUR_API_KEY_PLACEHOLDER';
  console.log('⚠️ No API key found in Environment or .env. using placeholder.');
}

// Read config.js file
const configPath = path.join(__dirname, '../public/assets/js/config.js');
try {
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Replace the placeholder with actual API key
  configContent = configContent.replace(
    /const GOOGLE_MAPS_API_KEY = ['"].*?['"];/,
    `const GOOGLE_MAPS_API_KEY = '${googleApiKey}';`
  );

  // Write back to config.js
  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log('✅ Google Maps API key injected successfully!');
} catch (err) {
  console.error('❌ Error writing to config.js:', err.message);
  process.exit(1); // Exit with error if we can't write the config
}