const fs = require('fs');
const path = require('path');
const axios = require('axios');
const url = require('url');

const M3U_URL = 'https://iptv-org.github.io/iptv/index.m3u';
const NEXT_CONFIG_PATH = path.join(__dirname, '..', 'next.config.ts');

// Additional domains to always include
const ADDITIONAL_DOMAINS = [
  'i.imgur.com',
  'image.tmdb.org',
  'upload.wikimedia.org',
  'via.placeholder.com',
  'static.wikia.nocookie.net',
  'logo.clearbit.com',
  'www.themoviedb.org',
  'images.unsplash.com',
  'pbs.twimg.com',
  'res.cloudinary.com',
  'assets.example.com',
  'cdn.example.com',
  'admango.cdn.mangomolo.com',
  'www.lyngsat-logo.com',
  'www.lyngsat.com',
  'graph.facebook.com',
  'static.epg.best',
  'cdn.jsdelivr.net',
  'i.ibb.co'
];

async function fetchM3U() {
  try {
    const response = await axios.get(M3U_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching M3U file:', error);
    return '';
  }
}

function extractDomains(content) {
  const domains = new Set(ADDITIONAL_DOMAINS);
  
  // Extract logo URLs from the M3U content
  const logoRegex = /tvg-logo="([^"]+)"/g;
  let match;
  
  while ((match = logoRegex.exec(content)) !== null) {
    try {
      const logoUrl = match[1];
      if (logoUrl && logoUrl.startsWith('http')) {
        const parsedUrl = new URL(logoUrl);
        domains.add(parsedUrl.hostname);
      }
    } catch (error) {
      // Skip invalid URLs
    }
  }
  
  return Array.from(domains).sort();
}

function updateNextConfig(domains) {
  try {
    let configContent = fs.readFileSync(NEXT_CONFIG_PATH, 'utf8');
    
    // Create the new domains array string
    const domainsString = domains
      .map(domain => `      '${domain}'`)
      .join(',\n');
    
    // Replace the domains array in the config
    const newConfigContent = configContent.replace(
      /domains: \[\s*([^]*?)\s*\],/,
      `domains: [\n${domainsString}\n    ],`
    );
    
    fs.writeFileSync(NEXT_CONFIG_PATH, newConfigContent, 'utf8');
    console.log(`Updated next.config.ts with ${domains.length} image domains`);
  } catch (error) {
    console.error('Error updating next.config.ts:', error);
  }
}

async function main() {
  console.log('Fetching M3U file...');
  const m3uContent = await fetchM3U();
  
  if (!m3uContent) {
    console.error('Failed to fetch M3U content. Using only additional domains.');
    updateNextConfig(ADDITIONAL_DOMAINS);
    return;
  }
  
  console.log('Extracting domains from M3U content...');
  const domains = extractDomains(m3uContent);
  
  console.log(`Found ${domains.length} unique domains`);
  updateNextConfig(domains);
}

main().catch(console.error);
