const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const URL_FILE = path.join(__dirname, 'tunnel-url.txt');

async function createTunnel() {
  try {
    const tunnel = await localtunnel({
      port: PORT,
      subdomain: 'interview-coach-' + Math.floor(1000 + Math.random() * 9000)
    });

    console.log(`\n==============================================`);
    console.log(`🌐 ACTIVE PERSISTENT TUNNEL: ${tunnel.url}`);
    console.log(`==============================================\n`);

    fs.writeFileSync(URL_FILE, tunnel.url, 'utf8');

    tunnel.on('close', () => {
      console.log('Tunnel connection closed. Reconnecting in 2 seconds...');
      setTimeout(createTunnel, 2000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      try { tunnel.close(); } catch (e) {}
    });

  } catch (err) {
    console.error('Failed to create tunnel:', err.message, '- retrying in 3s...');
    setTimeout(createTunnel, 3000);
  }
}

createTunnel();

// Keep event loop alive
setInterval(() => {}, 60000);
