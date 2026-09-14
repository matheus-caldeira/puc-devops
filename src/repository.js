import { GraphQLError } from 'graphql';
import { initialCatalog } from './catalog.js';

export const STATUSES = ['PLAN_TO_READ', 'READING', 'ON_HOLD', 'DROPPED', 'COMPLETED'];

const normalize = (value) => value.trim().toLowerCase();

export const createRepository = (seed = initialCatalog) => {
  const mangas = new Map(seed.map((manga) => [manga.id, { ...manga }]));
  let nextId = mangas.size + 1;

  const list = ({ genre, author } = {}) =>
    [...mangas.values()].filter(
      (manga) =>
        (!genre || normalize(manga.genre) === normalize(genre)) &&
        (!author || normalize(manga.author).includes(normalize(author))),
    );

  const findById = (id) => mangas.get(id) ?? null;

  const add = ({ title, author, genre, year, status = 'PLAN_TO_READ' }) => {
    const duplicate = [...mangas.values()].find(
      (manga) => normalize(manga.title) === normalize(title) && normalize(manga.author) === normalize(author),
    );

    if (duplicate) {
      throw new GraphQLError(`Manga "${title}" by ${author} is already in the catalog`, {
        extensions: { code: 'MANGA_ALREADY_EXISTS' },
      });
    }

    if (!STATUSES.includes(status)) {
      throw new GraphQLError(`Invalid status "${status}"`, { extensions: { code: 'INVALID_STATUS' } });
    }

    const manga = { id: String(nextId++), title, author, genre, year, status };
    mangas.set(manga.id, manga);

    return manga;
  };

  const updateStatus = (id, status) => {
    const manga = mangas.get(id);

    if (!manga) {
      throw new GraphQLError(`Manga with id "${id}" was not found`, { extensions: { code: 'MANGA_NOT_FOUND' } });
    }

    if (!STATUSES.includes(status)) {
      throw new GraphQLError(`Invalid status "${status}"`, { extensions: { code: 'INVALID_STATUS' } });
    }

    manga.status = status;

    return manga;
  };

  return { list, findById, add, updateStatus };
};
