import serverless from 'serverless-http';

let cachedHandler;

export default async function handler(req, res) {
  if (!cachedHandler) {
    const { default: app } = await import('../server/app.js');
    cachedHandler = serverless(app);
  }
  return cachedHandler(req, res);
}