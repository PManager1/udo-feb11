const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse GOOGLE_MAPS_API_KEY from .env
const googleApiKeyMatch = envContent.match(/GOOGLE_MAPS_API_KEY=(.+)/);
const googleApiKey = googleApiKeyMatch ? googleApiKeyMatch[1].trim() : 'YOUR_API_KEY_PLACEHOLDER';

// Read config.js file
const configPath = path.join(__dirname, '../public/assets/js/config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace the placeholder with actual API key
configContent = configContent.replace(
  /const GOOGLE_MAPS_API_KEY = ['"].*?['"];/,
  `const GOOGLE_MAPS_API_KEY = '${googleApiKey}';`
);

// Write back to config.js
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ Google Maps API key injected into config.js successfully!');