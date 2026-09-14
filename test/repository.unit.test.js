import test from 'node:test';
import assert from 'node:assert/strict';
import { createRepository, STATUSES } from '../src/repository.js';

const seed = [
  { id: '1', title: 'Berserk', author: 'Kentaro Miura', genre: 'Dark Fantasy', year: 1989, status: 'READING' },
  { id: '2', title: 'Monster', author: 'Naoki Urasawa', genre: 'Thriller', year: 1994, status: 'COMPLETED' },
];

test('lists every manga from the seed', () => {
  const repository = createRepository(seed);

  assert.deepEqual(
    repository.list().map(({ title }) => title),
    ['Berserk', 'Monster'],
  );
});

test('filters by genre ignoring case and surrounding spaces', () => {
  const repository = createRepository(seed);

  assert.deepEqual(
    repository.list({ genre: '  thriller ' }).map(({ title }) => title),
    ['Monster'],
  );
});

test('filters by a fragment of the author name', () => {
  const repository = createRepository(seed);

  assert.deepEqual(
    repository.list({ author: 'miura' }).map(({ title }) => title),
    ['Berserk'],
  );
});

test('finds a manga by id and returns null when it does not exist', () => {
  const repository = createRepository(seed);

  assert.equal(repository.findById('2').title, 'Monster');
  assert.equal(repository.findById('404'), null);
});

test('adds a manga with PLAN_TO_READ as the default status', () => {
  const repository = createRepository(seed);

  const added = repository.add({ title: 'Kingdom', author: 'Yasuhisa Hara', genre: 'Historical', year: 2006 });

  assert.equal(added.id, '3');
  assert.equal(added.status, 'PLAN_TO_READ');
  assert.equal(repository.list().length, 3);
});

test('rejects a duplicate regardless of case', () => {
  const repository = createRepository(seed);

  assert.throws(
    () => repository.add({ title: 'BERSERK', author: 'kentaro miura', genre: 'Dark Fantasy', year: 1989 }),
    /already in the catalog/,
  );
});

test('rejects an unknown status on creation', () => {
  const repository = createRepository(seed);

  assert.throws(
    () => repository.add({ title: 'Kingdom', author: 'Yasuhisa Hara', genre: 'Historical', year: 2006, status: 'FINISHED' }),
    /Invalid status/,
  );
});

test('updates the status of an existing manga', () => {
  const repository = createRepository(seed);

  assert.equal(repository.updateStatus('1', 'COMPLETED').status, 'COMPLETED');
  assert.equal(repository.findById('1').status, 'COMPLETED');
});

test('fails to update a manga that does not exist', () => {
  const repository = createRepository(seed);

  assert.throws(() => repository.updateStatus('404', 'READING'), /was not found/);
});

test('keeps each repository isolated from the seed it received', () => {
  const first = createRepository(seed);
  first.updateStatus('1', 'DROPPED');

  assert.equal(createRepository(seed).findById('1').status, 'READING');
  assert.ok(STATUSES.includes('DROPPED'));
});
