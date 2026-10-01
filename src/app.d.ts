import type { D1Database, R2Bucket, ExecutionContext } from '@cloudflare/workers-types';
declare global {
 namespace App {
  interface Platform { env: { DB: D1Database; MEDIA: R2Bucket }; context: ExecutionContext }
 }
}
export {};
