import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export const ensureDirectory = (dirPath) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
};

export const readJsonFile = (filePath, fallbackValue = []) => {
  try {
    if (!existsSync(filePath)) {
      return fallbackValue;
    }

    const raw = readFileSync(filePath, 'utf8').trim();

    if (!raw) {
      return fallbackValue;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read JSON file: ${filePath}`, error);
    return fallbackValue;
  }
};

export const writeJsonFile = (filePath, data) => {
  ensureDirectory(dirname(filePath));
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

export const seedJsonFileIfMissingOrEmpty = (filePath, seedData) => {
  const hasFile = existsSync(filePath);

  if (!hasFile) {
    writeJsonFile(filePath, seedData);
    return;
  }

  const currentData = readJsonFile(filePath, null);

  if (
    currentData === null ||
    (Array.isArray(currentData) && currentData.length === 0) ||
    (typeof currentData === 'object' &&
      !Array.isArray(currentData) &&
      Object.keys(currentData).length === 0)
  ) {
    writeJsonFile(filePath, seedData);
  }
};