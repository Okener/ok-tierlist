// Local SQLite storage experiment; Node >=22.13, no packages or remote resources.
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: {
  lists: { type: 'string', default: '10000' },
  items: { type: 'string', default: '50' },
  views: { type: 'string', default: '0,10,100' },
  report: { type: 'string' },
} });
const listCount = Number(values.lists);
const itemCount = Number(values.items);
const stages = [...new Set([0, ...values.views.split(',').map(Number)])].sort((a, b) => a - b);
if (!Number.isSafeInteger(listCount) || listCount < 200 || listCount % 20 !== 0
    || !Number.isSafeInteger(itemCount) || itemCount < 1
    || stages.some(n => !Number.isSafeInteger(n) || n < 0)) {
  throw new Error('Use --lists a multiple of 20 >=200, --items a positive integer, --views nonnegative integers.');
}
const userCount = listCount / 10;
const templateCount = listCount / 20;
const directory = mkdtempSync(join(tmpdir(), 'ok-tierlist-storage-'));
const path = join(directory, 'benchmark.sqlite');
const db = new DatabaseSync(path);
db.exec('PRAGMA page_size=4096; PRAGMA foreign_keys=ON; PRAGMA journal_mode=DELETE;');
db.exec(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
const now = 1790769600;
const hash = text => createHash('sha256').update(text).digest();
const publicId = text => hash(text).subarray(0, 16).toString('base64url');
const insert = (table, columns) => db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${columns.split(',').map(() => '?').join(',')})`);
const user = insert('users', 'id,public_id,username,display_name,bio,created_at');
const auth = insert('auth_accounts', 'user_id,provider,provider_account_id,email,password_hash,created_at');
const session = insert('sessions', 'token_hash,user_id,expires_at,created_at');
const media = insert('media_assets', 'id,owner_id,object_key,thumbnail_key,mime_type,byte_size,width,height,created_at');
const template = insert('templates', 'id,public_id,owner_id,title,description,visibility,password_hash,created_at,updated_at,list_count,view_count,unique_view_count,popularity_score,popularity_updated_at');
const tier = insert('template_tiers', 'template_id,tier_index,label,color');
const item = insert('template_items', 'template_id,item_id,asset_id,label,pool_position');
const list = insert('tier_lists', 'id,public_id,template_id,owner_id,title,status,preview_asset_id,created_at,updated_at,like_count,view_count,unique_view_count');
const placement = insert('placements', 'list_id,template_id,item_id,tier_index,position');
const like = insert('likes', 'list_id,user_id,created_at');
const friend = insert('friendships', 'user_low_id,user_high_id,requested_by,status,created_at,updated_at');
const consensus = insert('consensus_items', 'template_id,item_id,weighted_position_sum,weight_sum,contributor_count,updated_at');
const viewer = insert('list_viewers', 'list_id,viewer_key,first_seen_at');

function transaction(fn) {
  db.exec('BEGIN');
  try { fn(); db.exec('COMMIT'); } catch (error) { db.exec('ROLLBACK'); throw error; }
}
let assetId = 0;
function asset(owner, kind, serial) {
  const key = `${kind}/${publicId(`${kind}:${serial}`)}`;
  media.run(++assetId, owner, `${key}/original.webp`, `${key}/thumb-256.webp`, 'image/webp', 80000 + serial % 120000, 800, 800, now);
  return assetId;
}

console.error(`Seeding ${listCount} lists × ${itemCount} items in ${path}`);
transaction(() => {
  for (let u = 1; u <= userCount; u++) {
    user.run(u, publicId(`user:${u}`), `member_${u}`, `Example Member ${u}`, 'Tier-list enthusiast. Comparing favorites and sharing rankings with friends.', now);
    auth.run(u, 'credential', `member_${u}@example.test`, `member_${u}@example.test`, '$argon2id$v=19$m=65536,t=3,p=1$' + publicId(`salt:${u}`) + '$' + hash(`password:${u}`).toString('base64url'), now);
    for (let s = 0; s < 2; s++) session.run(hash(`session:${u}:${s}`), u, now + 2592000, now);
    if (u % 2 === 0) db.prepare('UPDATE users SET avatar_asset_id=? WHERE id=?').run(asset(u, 'avatar', u), u);
  }
  for (let t = 1; t <= templateCount; t++) {
    const visibility = t % 10 === 0 ? 'password' : t % 10 === 1 ? 'unlisted' : 'public';
    template.run(t, publicId(`template:${t}`), (t - 1) % userCount + 1, `Community ranking template ${t}`, 'Rank these items from your favorites to your least favorites. Share your finished list and compare it with the community consensus.', visibility, visibility === 'password' ? 'x'.repeat(97) : null, now, now, 20, 0, 0, 12.3456, now);
    for (let r = 0; r < 5; r++) tier.run(t, r, ['S', 'A', 'B', 'C', 'D'][r], '#ff8080');
    for (let i = 0; i < itemCount; i++) {
      item.run(t, i, asset((t - 1) % userCount + 1, 'item', (t - 1) * itemCount + i), `Example item ${i}: descriptive label`, i);
      consensus.run(t, i, 400.5, 220, 20, now);
    }
  }
  for (let u = 1; u <= userCount; u++) {
    // Ring graph: five outgoing edges = roughly ten friends per user.
    for (let k = 1; k <= 5; k++) {
      const other = (u + k - 1) % userCount + 1;
      friend.run(Math.min(u, other), Math.max(u, other), u, k === 5 ? 'pending' : 'accepted', now, now);
    }
  }
});
for (let start = 1; start <= listCount; start += 500) transaction(() => {
  for (let l = start; l < Math.min(start + 500, listCount + 1); l++) {
    const t = Math.floor((l - 1) / 20) + 1;
    const owner = (l - 1) % userCount + 1;
    list.run(l, publicId(`list:${l}`), t, owner, `My personal ranking of template ${t}`, 'published', asset(owner, 'preview', l), now, now, 10, 0, 0);
    for (let i = 0; i < itemCount; i++) {
      const bucket = (i + l) % 6;
      placement.run(l, t, i, bucket === 5 ? null : bucket, Math.floor(i / 6));
    }
    for (let k = 1; k <= 10; k++) like.run(l, (owner + k - 1) % userCount + 1, now);
  }
});

function snapshot(database = db, file = path) {
  const pageCount = database.prepare('PRAGMA page_count').get().page_count;
  const pageSize = database.prepare('PRAGMA page_size').get().page_size;
  const freelist = database.prepare('PRAGMA freelist_count').get().freelist_count;
  if (pageCount * pageSize !== statSync(file).size) throw new Error('Page count and file size disagree');
  // dbstat is optional in SQLite builds; total page/file sizes remain available
  // even when a build cannot report individual table/index sizes.
  let objects = null;
  try {
    objects = database.prepare(`SELECT s.name, COALESCE(m.type, 'internal') AS type,
      COALESCE(m.tbl_name, s.name) AS table_name, SUM(s.pgsize) AS bytes,
      SUM(s.payload) AS payload_bytes, SUM(s.unused) AS unused_bytes
      FROM dbstat s LEFT JOIN sqlite_schema m ON m.name=s.name
      GROUP BY s.name ORDER BY bytes DESC`).all();
  } catch (error) {
    if (!error.message.includes('dbstat')) throw error;
  }
  return { bytes: pageCount * pageSize, file_bytes: statSync(file).size,
    page_size: pageSize, free_bytes: freelist * pageSize, objects };
}

const results = [];
let previous = 0;
for (const count of stages) {
  console.error(`Measuring ${count} unique viewers/list…`);
  const keys = Array.from({ length: count - previous }, (_, i) => hash(`viewer:${i + previous}`).subarray(0, 16));
  for (let start = 1; start <= listCount && count > previous; start += 100) transaction(() => {
    for (let l = start; l < Math.min(start + 100, listCount + 1); l++) {
      for (const key of keys) viewer.run(l, key, now);
    }
  });
  transaction(() => {
    db.prepare('UPDATE tier_lists SET view_count=?, unique_view_count=?').run(count * 2, count);
    db.prepare('UPDATE templates SET view_count=?, unique_view_count=?').run(count * 40, count * 20);
  });
  const integrity = db.prepare('PRAGMA integrity_check').get().integrity_check;
  const foreignKeys = db.prepare('PRAGMA foreign_key_check').all();
  if (integrity !== 'ok' || foreignKeys.length) throw new Error('Database validation failed');
  const expectedCounts = { users: userCount, templates: templateCount,
    template_items: templateCount * itemCount, tier_lists: listCount,
    placements: listCount * itemCount, likes: listCount * 10, list_viewers: listCount * count };
  const rowCounts = {};
  for (const [table, expected] of Object.entries(expectedCounts)) {
    rowCounts[table] = db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;
    if (rowCounts[table] !== expected) throw new Error(`Unexpected row count for ${table}`);
  }
  const natural = snapshot();
  // Compact a separate copy so later stages retain natural index/page growth.
  const compactPath = join(directory, `compact-${count}.sqlite`);
  db.prepare('VACUUM INTO ?').run(compactPath);
  const compactDb = new DatabaseSync(compactPath);
  const compact = snapshot(compactDb, compactPath);
  compactDb.close();
  const bytesPerList = natural.bytes / listCount;
  results.push({ viewers_per_list: count, viewer_records: count * listCount,
    natural, compact, bytes_per_list: bytesPerList,
    projected_lists_at_7GB: Math.floor(7e9 / bytesPerList),
    projected_lists_at_10GB: Math.floor(1e10 / bytesPerList),
    row_counts: rowCounts, integrity_check: integrity, foreign_key_violations: foreignKeys.length });
  previous = count;
}
const report = {
  measured_at: new Date().toISOString(), node: process.version,
  sqlite: db.prepare('SELECT sqlite_version() AS version').get().version,
  schema_sha256: hash(readFileSync(new URL('../db/schema.sql', import.meta.url))).toString('hex'),
  database_path: path,
  assumptions: { lists: listCount, items_per_template: itemCount, templates: templateCount,
    users: userCount, tiers: 5, likes_per_list: 10, sessions_per_user: 2,
    friendship_edges_per_user: 5, uploaded_avatars_fraction: 0.5,
    preview_assets_per_list: 1, image_files_in_database: false,
    internal_ids: 'integer', public_ids: '22-character text', viewer_keys: '16-byte blob',
    retained_drafts: 0, edit_history: false },
  results,
};
db.close();
if (values.report) writeFileSync(values.report, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ database_path: path, results: results.map(r => ({
  viewers_per_list: r.viewers_per_list, MB: r.natural.bytes / 1e6,
  compact_MB: r.compact.bytes / 1e6, bytes_per_list: r.bytes_per_list,
  lists_at_7GB: r.projected_lists_at_7GB, lists_at_10GB: r.projected_lists_at_10GB,
  object_breakdown_available: r.natural.objects !== null,
})) }, null, 2));
