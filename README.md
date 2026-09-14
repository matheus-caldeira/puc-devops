# Manga Catalog API

API GraphQL para catálogo de mangás, manhwas e manhuas, escrita em Node.js.
Projeto usado como base das atividades de DevOps: versionamento com Git, CI/CD
via GitHub Actions e empacotamento em container Docker.

## Stack

- Node.js 24 (ES Modules)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) como servidor GraphQL
- `node:test` para os testes automatizados
- Docker (imagem multi-stage baseada em `node:24-alpine`)

## Funcionalidades

- Consulta da lista de mangás, com filtro opcional por gênero e por autor
- Consulta de um mangá específico pelo identificador
- Cadastro de novos mangás
- Atualização do status de leitura de um mangá
- Endpoint de healthcheck em `/health`

## Como rodar localmente

Pré-requisito: Node.js 24 ou superior.

```bash
npm install
npm start
```

O servidor sobe em `http://localhost:4000`. A interface interativa do GraphQL
fica disponível em `http://localhost:4000/graphql` e o healthcheck em
`http://localhost:4000/health`.

Exemplo de consulta:

```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ mangas { id title author genre year status } }"}'
```

## Como rodar os testes

```bash
npm test
```

## Como rodar via Docker

```bash
docker build -t mcc-mangas .
docker run -d --name mcc-mangas -p 4000:4000 mcc-mangas
```

Para conferir se o container está de pé:

```bash
docker ps
curl http://localhost:4000/health
```

Para remover o container:

```bash
docker rm -f mcc-mangas
```

## Estrutura do projeto

```text
src/
├── catalog.js     # dados iniciais do catálogo
├── repository.js  # repositório em memória
├── schema.js      # schema GraphQL e resolvers
├── server.js      # criação do servidor HTTP
└── index.js       # ponto de entrada
test/
└── api.test.js    # testes das queries, mutations e casos de erro
```

## CI/CD

- `.github/workflows/ci.yml`: instala as dependências e roda os testes a cada
  push e a cada pull request.
- `.github/workflows/cd.yml`: constrói a imagem Docker e publica no GitHub
  Container Registry quando há push no branch `main`.
