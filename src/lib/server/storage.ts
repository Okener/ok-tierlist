import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

// Internal binding adapters only. Callers must authorize before invoking these.
// No public upload or media route exists until the access and upload rules are agreed.
export function storage(platform: App.Platform | undefined) {
 if (!platform) throw new Error('Cloudflare bindings unavailable. Use the local Workers runtime.');
 return { db: platform.env.DB, media: platform.env.MEDIA };
}
export async function databaseReady(db: D1Database) {
 return db.prepare('SELECT name FROM sqlite_master WHERE type = ? AND name = ?').bind('table', 'templates').first<{ name: string }>();
}
export function mediaStore(bucket: R2Bucket) {
 return {
  get: (key: string) => bucket.get(key),
  put: (key: string, bytes: ArrayBuffer, contentType: string) => bucket.put(key, bytes, { httpMetadata: { contentType } }),
  delete: (key: string) => bucket.delete(key)
 };
}
