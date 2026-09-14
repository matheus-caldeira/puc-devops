import { createSchema } from 'graphql-yoga';

export const typeDefs = /* GraphQL */ `
  enum Status {
    PLAN_TO_READ
    READING
    ON_HOLD
    DROPPED
    COMPLETED
  }

  type Manga {
    id: ID!
    title: String!
    author: String!
    genre: String!
    year: Int!
    status: Status!
  }

  input AddMangaInput {
    title: String!
    author: String!
    genre: String!
    year: Int!
    status: Status
  }

  type Query {
    mangas(genre: String, author: String): [Manga!]!
    manga(id: ID!): Manga
  }

  type Mutation {
    addManga(input: AddMangaInput!): Manga!
    updateMangaStatus(id: ID!, status: Status!): Manga!
  }
`;

export const resolvers = {
  Query: {
    mangas: (_parent, args, { repository }) => repository.list(args),
    manga: (_parent, { id }, { repository }) => repository.findById(id),
  },
  Mutation: {
    addManga: (_parent, { input }, { repository }) => repository.add(input),
    updateMangaStatus: (_parent, { id, status }, { repository }) => repository.updateStatus(id, status),
  },
};

export const schema = createSchema({ typeDefs, resolvers });
