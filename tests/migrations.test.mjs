import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';

test('application migrations enforce feature ownership and clear deleted selections', () => {
 const db = new DatabaseSync(':memory:');
 try {
  db.exec('PRAGMA foreign_keys=ON');
  for (const file of readdirSync('migrations').sort()) db.exec(readFileSync(`migrations/${file}`, 'utf8'));
  db.exec(`INSERT INTO users(id,public_id,username,display_name,created_at) VALUES(1,'u1','one','One',1),(2,'u2','two','Two',1);
  INSERT INTO templates(id,public_id,owner_id,title,created_at,updated_at) VALUES(1,'t1',1,'Test',1,1);
  INSERT INTO tier_lists(id,public_id,template_id,owner_id,title,created_at,updated_at) VALUES(1,'l1',1,1,'Test',1,1);`);
  assert.throws(() => db.exec('INSERT INTO profile_features VALUES(2,1)'), /FOREIGN KEY/);
  db.exec('INSERT INTO profile_features VALUES(1,1)');
  db.exec('DELETE FROM tier_lists WHERE id=1');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM profile_features').get().n, 0);
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name='auth_accounts'").get().n, 0);
 } finally { db.close(); }
});
