# ok-tierlist
a social tier list app

## Local app

Requires Node >=22.13.

```sh
npm ci
npm run db:migrate
npm run dev
```

Open http://127.0.0.1:5173. The profile, feed, and template layouts currently
use labeled sample data. Theme, sidebar, collection paging, and Load more work.
Account actions, ranking, publishing, and consensus are not implemented yet.

```sh
npm run check
npm test
npm run build
npm run check:bindings
npm run preview
```

`preview` runs the built app in the local Workers runtime. `check:bindings`
requires local migrations and verifies D1 and a disposable R2 object. No remote
resources are needed. See [foundation status and open decisions](docs/foundation.md).

Before deployment, create a D1 database and R2 bucket, replace the all-zero
database ID in `wrangler.jsonc`, apply migrations with `npx wrangler d1 migrations
apply DB --remote`, then run `npm run deploy`. No deployment has been performed.

## Architecture and database design

- [Architecture, current decisions, and delivery handoff](docs/architecture.md)
- [Product sketches and agent-readable design notes](docs/sketches/README.md)
- [Draft SQLite/D1 schema](db/schema.sql)
- [Measured storage, assumptions, and design decisions](docs/database-design.md)
- [Raw benchmark reports](docs/storage/)

Run the schema checks and a local storage experiment with Node >=22.13:

```sh
node --test tests/schema.test.mjs
node scripts/storage-benchmark.mjs
```

The benchmark uses Node's built-in SQLite, creates disposable databases in the
system temporary directory, and needs no packages or cloud resources.
