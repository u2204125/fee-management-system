const serverConfig = {
  port: parseInt(process.env.PORT, 10) || 3001,
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fee-management'
};

module.exports = serverConfig;

if (isSharedHosting) {
  console.log('Running in shared hosting mode');
  
  // Many shared hosts require binding to a specific port
  if (process.env.NODE_PORT) {
    console.log(`Using shared hosting port: ${process.env.NODE_PORT}`);
    // Override the port with NODE_PORT for shared hosting environments
    serverConfig.port = process.env.NODE_PORT;
  }
  
  // Some shared hosts require a specific address binding
  if (process.env.BIND_IP) {
    console.log(`Binding to specific IP: ${process.env.BIND_IP}`);
  }
  
  // Set production API URL for shared hosting
  if (process.env.API_URL) {
    console.log(`Using API URL: ${process.env.API_URL}`);
  }
}

// Helper function to get the base URL
serverConfig.getBaseUrl = function() {
  const port = this.port !== 80 && this.port !== 443 ? `:${this.port}` : '';
  return `${this.protocol}://${this.host}${port}`;
};

module.exports = serverConfig;