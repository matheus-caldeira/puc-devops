import { GraphQLError } from 'graphql';
import { normalize, validateMangaInput, validateStatus } from './validators.js';

const notFound = (id) =>
  new GraphQLError(`Manga with id "${id}" was not found`, { extensions: { code: 'MANGA_NOT_FOUND' } });

const duplicate = ({ title, author }) =>
  new GraphQLError(`Manga "${title}" by ${author} is already in the catalog`, {
    extensions: { code: 'MANGA_ALREADY_EXISTS' },
  });

export const createUseCases = (repository) => {
  const listMangas = ({ genre, author } = {}) =>
    repository.all().filter(
      (manga) =>
        (!genre || normalize(manga.genre) === normalize(genre)) &&
        (!author || normalize(manga.author).includes(normalize(author))),
    );

  const findManga = (id) => repository.findById(id);

  const addManga = (input) => {
    const manga = validateMangaInput(input);

    const alreadyExists = repository
      .all()
      .some((other) => normalize(other.title) === normalize(manga.title) && normalize(other.author) === normalize(manga.author));

    if (alreadyExists) {
      throw duplicate(manga);
    }

    return repository.save(manga);
  };

  const updateMangaStatus = (id, status) => {
    const manga = repository.findById(id);

    if (!manga) {
      throw notFound(id);
    }

    return repository.update(id, { status: validateStatus(status) });
  };

  return { listMangas, findManga, addManga, updateMangaStatus };
};
