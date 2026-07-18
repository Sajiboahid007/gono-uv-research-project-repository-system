const net = require('net');
const client = new net.Socket();

client.connect(3000, '127.0.0.1', () => {
  console.log('PORT_3000_IS_OPEN');
  client.destroy();
  process.exit(0);
});

client.on('error', (err) => {
  console.log('PORT_3000_IS_CLOSED:', err.message);
  process.exit(0);
});


