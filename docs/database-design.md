# Draft database design and measured storage

This is a schema and capacity experiment for `spec.md`, not an application
implementation. The current launch direction is Cloudflare D1; see the
[architecture and handoff document](architecture.md) for decision status, asynchronous
view counting, remaining product choices, and deployment validation work.
The schema targets SQLite/D1.
Its relational model can be ported to PostgreSQL, but its SQL types, identity
generation, `WITHOUT ROWID` optimizations, and byte measurements are SQLite-specific.

The later [sketch decisions](sketches/README.md) add manual selection of a featured
list and define a friends' activity feed. The measured draft schema does not yet
persist that selection or define feed-event history. Incorporate these during
implementation migrations after remaining behavior questions are resolved; do not
treat these benchmark results as measurements of those future additions.

## Findings

The initial napkin estimate was conservative. With 50 items per template, measured
storage is **about 4.05 KB per completed list before viewer records**, including its
share of templates, users, authentication, social relationships, and media metadata.
With 100 retained unique viewer identifiers per list, that becomes **7.30 KB**.
The earlier estimates were 13 KB and 28 KB respectively.

All sizes below are decimal: KB = 1,000 bytes; GB = 1,000,000,000 bytes. These
projections use the naturally grown database, not the smaller vacuumed copy.

| Dataset | Viewers per list | Measured database | KB per list | Projected lists at 7 GB | Projected lists at 10 GB |
| --- | ---: | ---: | ---: | ---: | ---: |
| 50,000 lists, 50 items | 0 | 202.70 MB | 4.05 | 1,727,000 | 2,467,000 |
| 50,000 lists, 50 items | 10 | 220.20 MB | 4.40 | 1,589,000 | 2,271,000 |
| 50,000 lists, 50 items | 100 | 365.24 MB | 7.30 | 958,000 | 1,369,000 |
| 2,000 lists, 50 items | 1,000 | 72.35 MB | 36.17 | 194,000 | 276,000 |
| 10,000 lists, 200 items | 100 | 167.48 MB | 16.75 | 418,000 | 597,000 |

The zero-view scenario means no retained viewer identities, not an implementation
of unique counting using only counters. A counter cannot deduplicate visitors.

At **1,000 new completed lists/day**, the 50-item, 100-viewer scenario reaches the
7 GB planning threshold in about **2.6 years**, and 10 GB in about **3.75 years**.
At 10,000/day, these become about 96 and 137 days. These assume constant creation
rates and the stated lifetime activity mix, not continuously growing views on every
old list. Viral viewing can change the outcome independently of list creation.

7 GB is a proposed planning threshold, not a Cloudflare limit. Projected capacities
are linear extrapolations, not promises: larger integer IDs, different insertion
patterns, drafts, text lengths, churn, and later schema changes affect storage.

## Method and reproducibility

Run with Node >=22.13 (measured with Node 26.0.0), without installing packages:

```sh
node --test tests/schema.test.mjs
node scripts/storage-benchmark.mjs --lists 10000 --report docs/storage/10000-lists-50-items.json
node scripts/storage-benchmark.mjs --lists 50000 --report docs/storage/50000-lists-50-items.json
node scripts/storage-benchmark.mjs --lists 10000 --items 200 --report docs/storage/10000-lists-200-items.json
node scripts/storage-benchmark.mjs --lists 2000 --views 0,10,100,1000 --report docs/storage/2000-lists-1000-viewers.json
```

Each invocation creates a new disposable database directory in the system temporary
directory and prints its path. It never opens an existing application database.
JSON reports are intentionally overwritten if the same `--report` path is supplied.
The generated databases and compact copies remain in the temporary directory for
inspection; they are not repository artifacts.

The script measures 4,096-byte SQLite pages and actual database file size, with all
schema indexes present. It records per-table/per-index pages using `dbstat` when
available, including payload and unused page space. The comparison `VACUUM INTO`
creates a separate compact copy; it does not compact the source between scenarios.
Foreign keys are enabled during insertion. Each scenario runs integrity and foreign
key checks; the script also checks expected row counts and file/page-size agreement.

The 10,000-list run measured 3.95 KB/list before views and 7.17 KB/list with 100
viewers. The 50,000-list run measured 4.05 and 7.30 KB respectively, a roughly 2–3%
increase. This is a useful size-sensitivity check, not proof of constant cost at
millions of lists. All raw reports include schema hashes and SQLite versions.

**This is local SQLite, not a deployment to Cloudflare.** D1 uses SQLite, making
this a useful storage proxy, but provider metadata, engine differences, and actual
operational growth still need validation on D1 before relying on a capacity ceiling.
It is not a throughput or latency benchmark. No cloud resources were provisioned.

## Synthetic workload

- One user per 10 lists; one template per 20 lists.
- Five tiers, with about one sixth of items left in the unranked pool.
- Every list has a placement record for every template item, including unranked items.
- Ten likes per list; five relationship edges per user (roughly eight accepted
  friends and two pending relationships touching each user).
- One credential account and two active sessions per user; half have uploaded avatars.
- Every completed list has metadata for a generated share image.
- Every template item has image metadata, an original object key, and a thumbnail key.
- Every template item has a populated consensus-cache row; popularity caches are populated.
- Templates are 80% public, 10% unlisted, and 10% password-protected.
- Public IDs are 22-character opaque strings; internal references are integers.
- Viewer identifiers are 16-byte opaque hashes, reused across lists, inserted in
  pseudorandom key order. Each `(list, viewer)` pair is stored once for its lifetime.
- Template descriptions are about 130 characters; users have short bios; labels,
  list titles, account fields, and session hashes are populated rather than empty.
- All generated lists are published. Draft accumulation, edit history, additional
  auth-provider tokens, job queues, notifications, and audit logs are not modeled.
- Sessions would expire in production; the model holds two per user. Benchmark
  credentials and identifiers are deterministic synthetic data, never real secrets.

All images and downloadable files live in object storage. Their encoded bytes are
not counted in D1. A thousand lists referencing one template reuse the same template
items and original images; only their placements and list metadata are new.

## Where storage goes

For the 50,000-list, 50-item dataset before views, including indexes:

| Data | Storage |
| --- | ---: |
| 2.5 million placements | 118.24 MB |
| Image metadata: template images, thumbnails, previews, avatars | 34.63 MB |
| 500,000 likes | 17.18 MB |
| List headers and indexes | 11.75 MB |
| Template item records and indexes | 10.41 MB |
| Consensus cache | 3.99 MB |
| Users, accounts, sessions, friendships, template headers/tiers, schema | 6.50 MB |
| **Total** | **202.70 MB** |

The placement table itself is 44.36 MB; its two indexes add 73.89 MB. Index storage
is included rather than guessed. We retain indexes supporting membership/order
integrity, consensus lookup, discovery, profile history, liked lists, and top lists.

Five million viewer records occupy **161.90 MB**, about **32.4 bytes each**. That is
well below the earlier 150-byte allowance. The compact composite primary key and
`WITHOUT ROWID` avoid a separate surrogate ID and duplicate primary-key index.
No retention-timestamp index is included because the baseline retains lifetime pairs.

These savings depend on the schema. UUID strings in every foreign key, hexadecimal
viewer hashes instead of binary values, extra indexes, or full URLs in every placement
would change the result. The benchmark does not assume compression of image files
or JSON blobs inside SQL.

## Schema coverage

| Spec feature | Storage design |
| --- | --- |
| Profiles, three section-visibility settings, theme | `users`; defaults match the spec |
| Avatar/Dicebear fallback | Nullable `avatar_asset_id`; stable public ID can seed Dicebear |
| Template visibility/password | `templates.visibility` and password hash with consistency check |
| Custom tier rows and image pool | `template_tiers`, `template_items`, `media_assets` |
| List editor and unranked pool | `tier_lists`, `placements`; null tier means unranked |
| Sharing, embeds, download previews | Public IDs and optional preview asset; embed HTML is rendered |
| Views and uniqueness | Counters plus `list_viewers` lifetime deduplication pairs |
| Template totals and popularity | Cached counts and indexed public-only popularity score |
| Likes and most-liked profile highlight | Unique `(list, user)` likes and owner/like-count index |
| Consensus | Normalized placements, likes, and rebuildable per-item aggregate cache |
| Friend requests and friends | One canonical user pair with requester and pending/accepted status |

`placements` has composite foreign keys ensuring that its item, tier, and parent
list belong to the same template. A list cannot contain the same item twice or put
two items in the same slot (including the unranked pool). Friendships cannot contain
self-pairs, reversed duplicate pairs, or requests originating outside the pair.
Likes and viewer pairs have unique keys. Uploaded assets are referenced, not copied.

## Decisions deliberately left at the application boundary

The latest decision register and handoff checklist live in [architecture.md](architecture.md).
Exact lifetime identifier counting is the launch approach; HyperLogLog/Durable Objects
are future options, not implemented schema features. Queue/event-deduplication storage
and the final authentication integration are not included in these measurements.

1. **Template edits after first use.** This draft assumes structure is frozen once
   a list references it. The application must enforce that policy. Supporting later
   structural edits would require explicit versions; this is not currently specified.
2. **Profile visibility versus resource access.** The spec explicitly controls profile
   sections, not independent list visibility. The schema stores those section settings
   and template access settings. We must settle how those interact on direct list URLs,
   embeds, consensus, previews, and image delivery before implementing authorization.
   SQL indexes and opaque IDs are not access control. Password-protected media must
   also require access checks rather than exposing public object URLs.
3. **Views.** `view_count` is total accepted view events; `unique_view_count` is distinct
   stored identifiers per list. The template's unique cache sums list-level uniques;
   it does not claim distinct people across all child lists. A person visiting five
   lists contributes five to that sum. Stable logged-in IDs and guest cookies cannot
   guarantee unique human identification across devices, resets, or sign-in changes.
4. **Consensus and popularity formulas.** No formula is silently finalized here.
   Unranked-item handling, within-tier position, zero-like lists, like weights,
   eligibility, and exact time decay remain product decisions. Aggregate fields
   provide storage space without making those decisions. Likes do not enter template
   popularity by design; application logic must preserve that rule.
5. **Transactional writes.** Save a complete arrangement atomically, checking the
   expected list revision and ownership. Atomic delete/reinsert avoids temporary
   slot conflicts when swapping items; validate complete item coverage before publish.
   On D1 use transactional batches rather than copying local `BEGIN` calls into
   independent remote requests. Viewer inserts and counter increments must be atomic,
   incrementing uniques only if insertion succeeded. Likes/unlikes and cached counts
   need the same discipline. Caches must be rebuildable/reconcilable.
6. **Authentication integration.** Accounts and sessions represent a credible storage
   allowance. They are not a promised Better Auth adapter schema. Once sign-in methods
   and the library are selected, adopt its migrations and rerun the benchmark.
7. **Deletion and cleanup.** Foreign keys intentionally restrict deletion rather than
   cascade through potentially millions of rows. Application cleanup must explicitly
   delete children in bounded operations, coordinate object-storage deletion, and
   invalidate aggregates. A future soft-delete design would need its own policy.

## References

Checked September 30, 2026:

- [D1 limits](https://developers.cloudflare.com/d1/platform/limits/): 10 GB per paid
  database; 500 MB per free database. The paid per-database ceiling cannot be raised.
- [D1 SQL support](https://developers.cloudflare.com/d1/sql-api/sql-statements/):
  SQLite-based SQL and available introspection.
- [D1 foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/):
  foreign-key enforcement and migration considerations.

The schema tests cover defaults, cross-template placement rejection, slot uniqueness,
atomic rearrangement/rollback, viewer and like deduplication, friendship invariants,
password-setting consistency, and discovery-index selection. They do not claim to
test application-level permissions, counter maintenance, or a remote D1 deployment.
