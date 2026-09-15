import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from './schema.js';
import { createRepository } from './repository.js';
import { findRoute } from './routes.js';

export const createApp = ({ repository = createRepository() } = {}) => {
  const yoga = createYoga({ schema, context: { repository }, logging: false });

  return createServer((req, res) => {
    const route = findRoute(req.url);

    if (route) {
      route(req, res);
      return;
    }

    yoga(req, res);
  });
};
