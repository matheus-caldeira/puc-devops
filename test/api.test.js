import test from 'node:test';
import assert from 'node:assert/strict';
import { createYoga } from 'graphql-yoga';
import { schema } from '../src/schema.js';
import { createRepository } from '../src/repository.js';

const execute = async (query, variables) => {
  const yoga = createYoga({ schema, context: { repository: createRepository() }, logging: false });

  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  return response.json();
};

test('lists every manga in the catalog', async () => {
  const { data } = await execute('{ mangas { id title author genre year status } }');

  assert.equal(data.mangas.length, 10);
  assert.equal(data.mangas[0].title, 'Berserk');
  assert.equal(data.mangas[0].year, 1989);
});

test('filters mangas by genre', async () => {
  const { data } = await execute('{ mangas(genre: "Historical") { title } }');

  assert.deepEqual(
    data.mangas.map(({ title }) => title),
    ['Vagabond', 'Vinland Saga'],
  );
});

test('filters mangas by author', async () => {
  const { data } = await execute('{ mangas(author: "urasawa") { title } }');

  assert.deepEqual(
    data.mangas.map(({ title }) => title),
    ['Monster'],
  );
});

test('finds a single manga by id', async () => {
  const { data } = await execute('{ manga(id: "4") { title author status } }');

  assert.deepEqual(data.manga, { title: 'Solo Leveling', author: 'Chugong', status: 'COMPLETED' });
});

test('returns null for a manga that does not exist', async () => {
  const { data } = await execute('{ manga(id: "999") { title } }');

  assert.equal(data.manga, null);
});

test('adds a new manga to the catalog', async () => {
  const mutation = `
    mutation ($input: AddMangaInput!) {
      addManga(input: $input) { id title author genre year status }
    }
  `;

  const input = { title: 'Kingdom', author: 'Yasuhisa Hara', genre: 'Historical', year: 2006 };
  const { data } = await execute(mutation, { input });

  assert.equal(data.addManga.id, '11');
  assert.equal(data.addManga.title, 'Kingdom');
  assert.equal(data.addManga.status, 'PLAN_TO_READ');
});

test('rejects a manga that is already in the catalog', async () => {
  const mutation = `
    mutation ($input: AddMangaInput!) {
      addManga(input: $input) { id }
    }
  `;

  const input = { title: 'berserk', author: 'Kentaro Miura', genre: 'Dark Fantasy', year: 1989 };
  const { errors } = await execute(mutation, { input });

  assert.match(errors[0].message, /already in the catalog/);
});

test('updates the status of a manga', async () => {
  const mutation = `
    mutation {
      updateMangaStatus(id: "9", status: READING) { title status }
    }
  `;

  const { data } = await execute(mutation);

  assert.deepEqual(data.updateMangaStatus, { title: 'Blame!', status: 'READING' });
});

test('fails to update the status of a manga that does not exist', async () => {
  const mutation = `
    mutation {
      updateMangaStatus(id: "999", status: READING) { title }
    }
  `;

  const { errors } = await execute(mutation);

  assert.match(errors[0].message, /was not found/);
});
