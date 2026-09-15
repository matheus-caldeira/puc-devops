import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATUSES,
  normalize,
  validateStatus,
  validateYear,
  validateRequiredText,
  validateMangaInput,
} from '../src/validators.js';

test('normalizes text by trimming and lowercasing it', () => {
  assert.equal(normalize('  Dark Fantasy '), 'dark fantasy');
  assert.equal(normalize('KENTARO'), 'kentaro');
});

test('accepts every known status and rejects an unknown one', () => {
  for (const status of STATUSES) {
    assert.equal(validateStatus(status), status);
  }

  assert.throws(() => validateStatus('FINISHED'), /Invalid status/);
  assert.throws(() => validateStatus('reading'), /Invalid status/);
});

test('accepts a plausible year and rejects the implausible ones', () => {
  assert.equal(validateYear(1989), 1989);

  assert.throws(() => validateYear(1899), /Invalid year/);
  assert.throws(() => validateYear(2100), /Invalid year/);
  assert.throws(() => validateYear(1989.5), /Invalid year/);
  assert.throws(() => validateYear('1989'), /Invalid year/);
});

test('requires a non-empty text and returns it trimmed', () => {
  assert.equal(validateRequiredText('  Berserk ', 'title'), 'Berserk');

  assert.throws(() => validateRequiredText('   ', 'title'), /Field "title" is required/);
  assert.throws(() => validateRequiredText(undefined, 'author'), /Field "author" is required/);
});

test('validates a whole manga input and applies the default status', () => {
  const manga = validateMangaInput({
    title: ' Kingdom ',
    author: ' Yasuhisa Hara ',
    genre: 'Historical',
    year: 2006,
  });

  assert.deepEqual(manga, {
    title: 'Kingdom',
    author: 'Yasuhisa Hara',
    genre: 'Historical',
    year: 2006,
    status: 'PLAN_TO_READ',
  });
});

test('rejects a manga input that carries an invalid field', () => {
  const valid = { title: 'Kingdom', author: 'Yasuhisa Hara', genre: 'Historical', year: 2006 };

  assert.throws(() => validateMangaInput({ ...valid, year: 1500 }), /Invalid year/);
  assert.throws(() => validateMangaInput({ ...valid, status: 'FINISHED' }), /Invalid status/);
  assert.throws(() => validateMangaInput({ ...valid, title: '' }), /Field "title" is required/);
});
