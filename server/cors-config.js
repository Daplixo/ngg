module.exports = {
  origin: [
    'http://localhost:5500',
    'https://localhost:5500',
    'http://127.0.0.1:5500',
    'https://127.0.0.1:5500',
    'https://daplixo.github.io'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
  'Origin',
  'X-Requested-With',
  'Content-Type',
  'Accept',
  'Authorization',
  'x-auth-token',
  'cache-control',
  'Pragma', // <== ✅ THIS is the line you need
  'Access-Control-Allow-Headers',
  'Access-Control-Allow-Origin'
],
  exposedHeaders: ['x-auth-token']
};
