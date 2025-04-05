/**
 * CORS Configuration
 * This file configures Cross-Origin Resource Sharing for the Express server
 */

// Export the CORS configuration options
module.exports = {
  // Allow requests from any origin
  origin: ['https://daplixo.github.io', 'http://127.0.0.1:5500'],

  // Allow credentials (cookies, authorization headers, etc)
  credentials: true,
  
  // Allow all HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  
  // Allowed headers (include cache-control as requested)
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization', 
    'x-auth-token', 
    'cache-control', 
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Origin'
  ],
  
  // Headers exposed to the client
  exposedHeaders: ['x-auth-token']
};
