import { TURBO_TOKEN } from '#pkg/constants.mjs';

process.env['AUTH_TOKENS'] = TURBO_TOKEN;
process.env['STORAGE_PROVIDER'] = 'local';
process.env['LOCAL_STORAGE_PATH'] = '/tmp/superturbo-cache';
