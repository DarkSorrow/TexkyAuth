const { createProxyMiddleware } = require('http-proxy-middleware');

const host = process.env.TEXKY_BACKEND_URL || 'http://localhost:8100';

module.exports = function(app) {
  app.use(
    '/Priv',
    createProxyMiddleware({
      target: host,
      changeOrigin: true,
    })
  );
};
