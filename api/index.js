let cachedApp;

export default async function handler(req, res) {
  if (!cachedApp) {
    const { default: app } = await import('../server/app.js');
    cachedApp = app;
  }
  return cachedApp(req, res);
}