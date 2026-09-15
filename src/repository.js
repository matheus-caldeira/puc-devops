import { initialCatalog } from './catalog.js';
import { createUseCases } from './use-cases.js';
import { STATUSES } from './validators.js';

export { STATUSES };

// Camada de persistencia: guarda os mangas e nada mais. Nenhuma regra de
// negocio mora aqui, so o armazenamento em memoria.
const createStore = (seed) => {
  const mangas = new Map(seed.map((manga) => [manga.id, { ...manga }]));
  let nextId = mangas.size + 1;

  return {
    all: () => [...mangas.values()],
    findById: (id) => mangas.get(id) ?? null,
    save: (manga) => {
      const saved = { id: String(nextId++), ...manga };
      mangas.set(saved.id, saved);

      return saved;
    },
    update: (id, changes) => {
      const manga = { ...mangas.get(id), ...changes };
      mangas.set(id, manga);

      return manga;
    },
  };
};

// O repositorio expoe os casos de uso ja ligados ao armazenamento. Os nomes
// list/add/updateStatus continuam existindo como atalhos para os casos de uso
// correspondentes, que e como o restante do projeto sempre chamou.
export const createRepository = (seed = initialCatalog) => {
  const store = createStore(seed);
  const useCases = createUseCases(store);

  return {
    ...useCases,
    list: useCases.listMangas,
    findById: useCases.findManga,
    add: useCases.addManga,
    updateStatus: useCases.updateMangaStatus,
  };
};
