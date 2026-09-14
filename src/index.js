import { createApp } from './server.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

createApp().listen(port, host, () => {
  console.log(`Manga Catalog API running on http://${host}:${port}/graphql`);
});
