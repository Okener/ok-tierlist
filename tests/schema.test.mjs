import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
function fixture(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec('PRAGMA foreign_keys=ON');
  db.exec(schema);
  db.exec(`
    INSERT INTO users(id,public_id,username,display_name,created_at) VALUES
      (1,'u1','alice','Alice',1),(2,'u2','bob','Bob',1),(3,'u3','carol','Carol',1);
    INSERT INTO media_assets(id,owner_id,object_key,mime_type,byte_size,width,height,created_at)
      VALUES (1,1,'one.webp','image/webp',100,10,10,1);
    INSERT INTO templates(id,public_id,owner_id,title,created_at,updated_at)
      VALUES (1,'t1',1,'First',1,1),(2,'t2',2,'Second',1,1);
    INSERT INTO template_tiers VALUES (1,0,'S','#ffffff'),(1,1,'A','#ffffff'),(2,0,'S','#ffffff');
    INSERT INTO template_items VALUES (1,0,1,'One',0),(1,1,1,'Two',1),(2,0,1,'One',0);
    INSERT INTO tier_lists(id,public_id,template_id,owner_id,title,created_at,updated_at)
      VALUES (1,'l1',1,1,'First list',1,1),(2,'l2',2,2,'Second list',1,1);
  `);
  return db;
}

test('profile privacy and theme defaults match the spec', t => {
  const db = fixture(t);
  const u = db.prepare('SELECT * FROM users WHERE id=1').get();
  assert.equal(u.created_visibility, 'public');
  assert.equal(u.liked_visibility, 'friends');
  assert.equal(u.friends_visibility, 'friends');
  assert.equal(u.theme, 'system');
  assert.equal(u.avatar_asset_id, null);
  assert.throws(() => db.exec("UPDATE users SET liked_visibility='everyone' WHERE id=1"), /CHECK/);
});

test('placements cannot cross templates or refer to absent items/tiers', t => {
  const db = fixture(t);
  const put = db.prepare('INSERT INTO placements VALUES(?,?,?,?,?)');
  assert.throws(() => put.run(1, 2, 0, 0, 0), /FOREIGN KEY/);
  assert.throws(() => put.run(1, 1, 999, 0, 0), /FOREIGN KEY/);
  assert.throws(() => put.run(1, 1, 0, 999, 0), /FOREIGN KEY/);
  put.run(1, 1, 0, null, 0);
  assert.throws(() => put.run(1, 1, 0, 0, 1), /UNIQUE/);
  assert.throws(() => put.run(1, 1, 1, null, 0), /UNIQUE/);
  assert.throws(() => put.run(1, 1, 1, 0, -1), /CHECK/);
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
});

test('atomic replacement permits reordering; failed replacement rolls back', t => {
  const db = fixture(t);
  db.exec('INSERT INTO placements VALUES (1,1,0,0,0),(1,1,1,0,1)');
  db.exec(`BEGIN;
    DELETE FROM placements WHERE list_id=1;
    INSERT INTO placements VALUES (1,1,0,0,1),(1,1,1,0,0);
    UPDATE tier_lists SET revision=revision+1 WHERE id=1;
    COMMIT;`);
  assert.equal(db.prepare('SELECT item_id FROM placements ORDER BY position LIMIT 1').get().item_id, 1);
  assert.equal(db.prepare('SELECT revision FROM tier_lists WHERE id=1').get().revision, 2);
  db.exec('BEGIN; DELETE FROM placements WHERE list_id=1;');
  assert.throws(() => db.exec('INSERT INTO placements VALUES(1,2,0,0,0)'), /FOREIGN KEY/);
  db.exec('ROLLBACK');
  assert.equal(db.prepare('SELECT count(*) AS n FROM placements').get().n, 2);
});

test('likes and lifetime viewer identifiers deduplicate', t => {
  const db = fixture(t);
  db.exec('INSERT INTO likes VALUES(1,2,1)');
  assert.throws(() => db.exec('INSERT INTO likes VALUES(1,2,2)'), /UNIQUE/);
  const put = db.prepare('INSERT INTO list_viewers VALUES(?,?,1) ON CONFLICT(list_id,viewer_key) DO NOTHING');
  assert.equal(put.run(1, Buffer.alloc(16, 1)).changes, 1);
  assert.equal(put.run(1, Buffer.alloc(16, 1)).changes, 0);
  assert.equal(put.run(2, Buffer.alloc(16, 1)).changes, 1);
  assert.throws(() => put.run(1, Buffer.alloc(4)), /CHECK/);
});

test('friendships enforce canonical pairs and valid request direction', t => {
  const db = fixture(t);
  db.exec("INSERT INTO friendships VALUES(1,2,2,'pending',1,1)");
  assert.throws(() => db.exec("INSERT INTO friendships VALUES(1,2,1,'pending',1,1)"), /UNIQUE/);
  assert.throws(() => db.exec("INSERT INTO friendships VALUES(2,1,1,'pending',1,1)"), /CHECK/);
  assert.throws(() => db.exec("INSERT INTO friendships VALUES(1,1,1,'pending',1,1)"), /CHECK/);
  assert.throws(() => db.exec("INSERT INTO friendships VALUES(1,3,2,'pending',1,1)"), /CHECK/);
});

test('password visibility requires a hash; discovery excludes protected/unlisted templates', t => {
  const db = fixture(t);
  assert.throws(() => db.exec("UPDATE templates SET visibility='password' WHERE id=1"), /CHECK/);
  db.exec("UPDATE templates SET visibility='password',password_hash='test-only' WHERE id=1");
  db.exec("UPDATE templates SET visibility='unlisted' WHERE id=2");
  assert.equal(db.prepare("SELECT count(*) AS n FROM templates WHERE visibility='public'").get().n, 0);
  const plan = db.prepare("EXPLAIN QUERY PLAN SELECT id FROM templates WHERE visibility='public' ORDER BY popularity_score DESC,id DESC LIMIT 20").all();
  assert.ok(plan.some(row => row.detail.includes('templates_discovery')));
});
