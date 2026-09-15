import { GraphQLError } from 'graphql';

export const STATUSES = ['PLAN_TO_READ', 'READING', 'ON_HOLD', 'DROPPED', 'COMPLETED'];

const CURRENT_YEAR = new Date().getFullYear();
const EARLIEST_YEAR = 1900;

const invalid = (message, code) => new GraphQLError(message, { extensions: { code } });

export const normalize = (value) => String(value).trim().toLowerCase();

export const validateStatus = (status) => {
  if (!STATUSES.includes(status)) {
    throw invalid(`Invalid status "${status}"`, 'INVALID_STATUS');
  }

  return status;
};

export const validateYear = (year) => {
  if (!Number.isInteger(year) || year < EARLIEST_YEAR || year > CURRENT_YEAR + 1) {
    throw invalid(`Invalid year "${year}"`, 'INVALID_YEAR');
  }

  return year;
};

export const validateRequiredText = (value, field) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw invalid(`Field "${field}" is required`, 'INVALID_INPUT');
  }

  return value.trim();
};

export const validateMangaInput = ({ title, author, genre, year, status = 'PLAN_TO_READ' }) => ({
  title: validateRequiredText(title, 'title'),
  author: validateRequiredText(author, 'author'),
  genre: validateRequiredText(genre, 'genre'),
  year: validateYear(year),
  status: validateStatus(status),
});
