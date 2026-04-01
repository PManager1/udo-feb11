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

// 1. Get the key from Netlify
let googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.Maps_API_KEY;

if (!googleApiKey) {
  console.warn('⚠️ No API key found in Netlify. Using placeholder.');
  googleApiKey = 'YOUR_API_KEY_PLACEHOLDER';
}

// 2. Define the Template and the Final destination
const templatePath = path.join(__dirname, '../public/assets/js/config.template.js');
const finalConfigPath = path.join(__dirname, '../public/assets/js/config.js');

try {
  // Check if the template exists (it should, because you pushed it to Git)
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template missing at ${templatePath}`);
  }

  // Read the "Blank" template
  let content = fs.readFileSync(templatePath, 'utf8');

  // Fill in the "Blank" with the real key
  content = content.replace('REPLACE_ME', googleApiKey);

  // Create the "Real" config.js file on the Netlify server
  fs.writeFileSync(finalConfigPath, content, 'utf8');
  
  console.log('✅ Created config.js from template successfully!');
} catch (err) {
  console.error('❌ Build failed:', err.message);
  process.exit(1); 
}