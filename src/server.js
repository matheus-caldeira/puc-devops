import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema.js';
import { createRepository } from './repository.js';

export const createApp = ({ repository = createRepository() } = {}) => {
  const yoga = createYoga({ schema, context: { repository }, logging: false });

  return createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
      return;
    }

    yoga(req, res);
  });
};
