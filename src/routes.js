// Rotas HTTP que nao passam pelo GraphQL.
//
// Hoje e apenas o healthcheck, usado pelo HEALTHCHECK do Dockerfile e pelo
// CD para saber se o container subiu de fato.
export const routes = {
  '/health': (_req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  },
};

export const findRoute = (url) => routes[url] ?? null;
