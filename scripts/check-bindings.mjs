import assert from 'node:assert/strict';
import { getPlatformProxy } from 'wrangler';
import { databaseReady, mediaStore } from '../src/lib/server/storage.ts';
const platform = await getPlatformProxy();
try {
 assert.equal((await databaseReady(platform.env.DB))?.name, 'templates');
 const media = mediaStore(platform.env.MEDIA);
 const key = `foundation-check/${crypto.randomUUID()}`;
 try {
  await media.put(key, new TextEncoder().encode('local R2 check').buffer, 'text/plain');
  const object = await media.get(key);
  assert.equal(await object.text(), 'local R2 check');
  assert.equal(object.httpMetadata.contentType, 'text/plain');
 } finally { await media.delete(key); }
 assert.equal(await media.get(key), null);
 console.log('Local D1 schema and R2 put/get/delete passed.');
} finally { await platform.dispose(); }
