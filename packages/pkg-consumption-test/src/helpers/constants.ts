import path from 'node:path';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const VERDACCIO_TEMP_FOLDER = path.join(__dirname, '..', '..', '.verdaccio');

export const PATHS = {
  VERDACCIO_TEMP_FOLDER,
  VERDACCIO_TEMP_FOLDER_CACHE: path.join(VERDACCIO_TEMP_FOLDER, 'cache'),
  VERDACCIO_TEMP_FOLDER_STORAGE: path.join(VERDACCIO_TEMP_FOLDER, 'storage'),
} as const;
