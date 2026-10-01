import assert from 'node:assert/strict';
for (const path of ['/me', '/feed', '/templates', '/settings']) {
 const response = await fetch(`http://127.0.0.1:${process.env.APP_PORT || 5173}${path}`);
 const html = await response.text();
 assert.equal(response.status, 200, path);
 assert.ok(html.includes('Layout preview'), `${path}: preview label`);
 assert.ok(html.includes('© 2026 Okener Enterprises, LLC'), `${path}: footer`);
 console.log(`${path}: HTTP 200, shell and footer present`);
}
