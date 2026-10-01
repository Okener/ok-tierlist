# Architecture and delivery handoff

Updated September 30, 2026.

Implementation has started at the owner’s request. See [foundation status](foundation.md)
for the executable scaffold, verification, and remaining boundaries. Earlier
pre-implementation statements below describe the original design handoff.
Email sign-in and guest publishing are now approved; email mechanism and guest
ownership/draft persistence are still open.
Passwords are required for password-protected templates even through direct links.
Derived lists inherit template privacy. Lists made from password-protected
templates cannot be embedded. Profile privacy versus direct links, media access
details, password grant duration, and privacy-change propagation remain open.
 Product requirements remain in [spec.md](../spec.md).
This document captures the conversation's current direction, distinguishing agreed
choices from working recommendations and unresolved product behavior. It is not a
claim that an application or Cloudflare deployment already exists.

## How we will build this

The delivery team is the project owner and coding agents. Keep the working brief
in this repository and implement small, reviewable increments. A separate team
handoff, formal estimation process, or exhaustive screen-flow document is not
required before starting a well-defined task.

The owner plans to provide sketches. Those will guide screen layout and interaction;
the earlier example sequence from share link through sign-in and publishing was
illustrative, not an approved flow. Do not turn it into mandatory screens or steps.
Guest access, sign-in timing, and publishing behavior remain open until clarified
through the sketches and product discussion.

Three sketches are recorded in the [sketch index](sketches/README.md): sidebar/profile,
Feed, and Templates, each with a readable source PNG, clean wireframe, and behavior notes.
The owner confirmed manual featuring of one's own lists; width-dependent row paging
with a Previous arrow away from the start; Likes below Lists; a push sidebar;
newest-first friend activity with grouped likes; template cards opening the editor
directly; Create template above the grid; and Load more on both Feed and Templates.
Template-sharing activity means publishing, not reposting. Standard accessibility implementation
is delegated to agents. These clarifications are also recorded in the numbered spec.

Profile rows sort Templates/Lists/Likes newest-first and Friends alphabetically;
Next is hidden at the end and touch swipes are supported. Feature on profile selects
an owned list; Use most-liked resets; deleted/unavailable selections fall back.
Other profiles show relationship-appropriate friend controls. Privacy-hidden sections
and their corresponding counts are omitted, without Private placeholders.
Feed like groups are per list per day. View consensus is a separate template-card
action; clicking the main card still starts ranking directly.
Daily groups use the viewer's local timezone and their newest like for ordering;
unlikes/privacy changes remove contributions. Most-liked ties choose the newest
list; no eligible list means no featured block.

Surface unclear product details to the owner for clarification now, rather than
silently marking them for later. Use concise grouped questions and continue independent
documentation work while answers are pending. Do not invent answers. Further sketches
remain in progress, so these references do not finalize every screen flow.

The benchmark schema predates the manual featured-list setting and feed behavior.
It does not yet persist the selected featured list or define feed-event history.
Add these deliberately in implementation migrations after remaining semantics are
settled; preserve the existing benchmark reports as evidence of the measured schema.

For each coding task, provide the relevant spec/sketch, intended behavior, acceptance
examples, and dependencies. Agents can make routine implementation choices within
that scope; consequential unresolved product behavior should be surfaced explicitly.
Completion notes should say what changed, how it was checked, and what remains.
Keep these docs current as decisions are made, rather than duplicating a large brief
in every task. This document records the plan; it does not start implementation.

The acceptance examples, milestones, and targets below are an accepted starting
point for refinement while the owner sketches, not a finalized launch contract.

## Current decisions

| Area | Current direction | Status |
| --- | --- | --- |
| Language | TypeScript for browser, server, and background application code | Agreed preference: one language until a measured bottleneck justifies otherwise |
| Framework | SvelteKit for server-rendered pages and the interactive editor | Working recommendation from the discussion; no framework scaffold exists |
| Hosting/database | Cloudflare-first, with D1 as the launch database | Current direction after measuring SQLite storage; remote validation outstanding |
| Media storage | R2 for uploads, thumbnails, avatars, and generated share images | Working architecture recommendation; image bytes stay out of D1 |
| Editor | Local drag-and-drop state, asynchronous saves, save/error feedback | Current approach; elaborate editor/undo/multi-selection features are outside the requested scope |
| Unique counts | Launch with exact stored viewer identifiers, processed asynchronously | Agreed approach following the counting discussion |
| Counting growth | Keep the counting implementation replaceable; consider exact-to-HyperLogLog conversion for large audiences | Future option, not a launch dependency or an approved change to metric accuracy |
| Capacity planning | Use measured indexed storage, with 7 GB as a planning threshold | Working operational recommendation; not a provider limit or capacity guarantee |

The earlier Hetzner/PostgreSQL/Node-server recommendation is an alternative, not
the current launch plan. Docker Compose, Caddy, node-postgres, and a PostgreSQL job
queue should not be carried into the Cloudflare implementation by default.

## Deployment model

```text
Browser (Svelte UI, local editor state)
  -> SvelteKit on Cloudflare Workers (pages, actions/API, authorization)
       -> D1 (application records, exact viewer sets, cached counts)
       -> R2 (media objects, through access-appropriate delivery)
       -> Cloudflare Queues (proposed durable asynchronous processing)
            -> TypeScript consumer -> D1 / media processing

Scheduled TypeScript work -> popularity/consensus refresh and maintenance
```

Queue consumers and scheduled handlers may be separate deployment entry points
in the same repository. Their final packaging is an implementation decision.

Production runs on **Workers, not a conventional Node server**. Node remains the
local build/test/benchmark toolchain. Use the Cloudflare adapter for SvelteKit;
Node API compatibility does not make every Node library or native addon available.
Validate authentication, password hashing, database access, image processing, and
share-image rendering against the actual Workers runtime before adopting packages.
The local `node:sqlite` benchmark is not the production database client.

Drizzle and Better Auth were recommendations, not finalized dependencies. Select a
D1-compatible query/migration approach and a Workers-compatible auth integration in
the foundation work. The current account/session tables are storage placeholders,
not an authentication library's completed integration.

Public images can use shared caching. Protected images, thumbnails, previews,
embeds, and HTML must respect the same access policy as their parent resources.
Opaque URLs do not provide authorization. Decide cache keys and invalidation for
visibility/password changes before implementing the delivery path.

## Unique-view counting at launch

Use the existing `list_viewers` unique key `(list_id, viewer_key)` for lifetime
deduplication of observed identifiers. Count an identifier once per list; do not
silently switch to daily uniqueness or expire those records while continuing to
claim lifetime uniqueness.

The proposed processing path is:

1. The browser emits a view event after the list meets an agreed visibility rule.
   Ordinary HTML fetches, social preview crawlers, and prefetches are not themselves
   sufficient. Exact dwell/visibility thresholds remain to be specified.
2. A server endpoint validates the resource/access and event, applies basic abuse
   controls, and durably enqueues it. Choose the queue failure/retry behavior explicitly.
3. A consumer inserts the viewer key and updates list/template unique counters
   atomically only when the pair was newly inserted. Replayed messages cannot add
   another unique view. Avoid separate nontransactional counter writes.
4. Pages read cached counts. The initial freshness target is within two minutes
   during normal operation (see provisional targets below); they need not block
   rendering while a view is recorded.

Cloudflare Queues has at-least-once delivery. The unique-pair constraint handles
duplicate unique-view contributions, but **does not deduplicate total view events**.
If total accepted-event counters are retained, the implementation also needs event
IDs and a retry-safe retention/deduplication policy. That storage is not yet in the
schema or benchmark. Alternatively, make summed list-level unique counts the
template popularity input, if selected as the product definition.

The recommended identity baseline is an account-derived identifier for signed-in
viewers and a random first-party cookie identifier for guests, converted to compact
opaque keys server-side. The exact mapping and guest-to-account behavior remain to
be specified. Cookie resets, multiple devices, and third-party embed partitioning
mean exact identifier counts are not exact counts of human beings. Avoid promising
otherwise. Hashing alone is not bot detection; bound abusive event creation before
it consumes storage or skews discovery.

Template totals must distinguish summing the unique counts of child lists from
deduplicating viewers across the template. The existing template unique counter
represents the former. Visiting three child lists can contribute three to it.

## Growth path, not launch work

- First measure production storage growth, query duration, queue lag, and write
  contention. Compact storage does not establish D1 throughput under viral traffic.
- For sufficiently large viewer sets, an exact-to-HyperLogLog transition could cap
  per-list state. Converting must include the existing identifiers and coordinate
  concurrent events. Threshold, implementation, accuracy, and displayed terminology
  need approval before replacing exact counts.
- Redis's documented HLL configuration uses up to 12 KiB at 0.81% standard error;
  this is an illustration, not the selection of Redis or a measured TypeScript HLL.
  Small exact sets can be cheaper. A million full-size summaries can still exceed
  the D1 limit, so approximate counting does not eliminate total-capacity planning.
- Durable Objects could own counting state separately from the main D1 database;
  exceptionally hot counters may need sharding and merging. Persist versioned count
  snapshots back to D1 without replaying duplicate increments. Benchmark before
  selecting this design. No Durable Objects or HLL infrastructure is needed at launch.
- HLL does not support simply removing an individual fraudulent viewer. Filtering,
  correction/rebuild requirements, and any raw-event retention must be designed
  before an approximate-counting migration.

## Evidence already available

- [Draft SQL schema](../db/schema.sql) with relationship constraints and indexes.
- [Database design and measurements](database-design.md), including workload
  assumptions and feature-to-table mapping.
- [Reproducible benchmark](../scripts/storage-benchmark.mjs) and [raw reports](storage/).
- [Six schema tests](../tests/schema.test.mjs), previously run successfully.

The largest run used 50,000 lists, 2.5 million placements, and 5 million viewer
records, consuming 365 MB locally including indexes. All four datasets passed
integrity/consistency checks. This does not validate deployed D1, concurrency,
throughput, authentication, authorization, or the media pipeline.

## Product decisions needed for an unambiguous implementation brief

The status column below distinguishes remaining decisions from selected defaults.
The owner delegated ranking, editor-flow and upload defaults; the concrete choices
and examples are in [product defaults](product-defaults.md).

| Decision | What must be specified | Suggested starting point |
| --- | --- | --- |
| Sign-in and guest flow | Approved: email sign-in and guest publishing. Open: email mechanism, guest drafts/ownership/recovery, and social-action permissions. | Do not require an account to publish. Settle remaining ownership and authentication details before integration. |
| Access policy | Approved: passwords apply even to direct links; derived lists inherit template privacy; no embeds for lists from password-protected templates. Still open: profile visibility versus direct URLs, media/consensus details, password grant duration, and privacy-change propagation. | Complete the access matrix without weakening the approved rules. Profile toggles must have clear UI wording. |
| Template/list lifecycle | Structural edits after first use; drafts, publishing, deletion, and orphaned assets | Freeze used template structure; create a new template for changed items/tiers. Save only current list state, with a clear publish action. |
| Ranking math | Defaults selected under owner delegation; see [formulas and examples](product-defaults.md). | Log-scaled view/list inputs with logarithmic age decay; consensus uses tier means weighted by `1 + sqrt(likes)`. Access eligibility remains dependent on the access matrix. |
| View semantics | Displayed metric, repeat visits, owner/bot views, visible-time threshold, embed identity, count freshness, total versus unique template input | Lifetime observed identifiers at launch; delayed display acceptable in principle. Set the exact rules before writing the consumer. |
| Editor and media limits | Defaults selected for creation/ranking flow, items/tiers, upload format/size/dimensions, and PNG export. | See [defaults and validation examples](product-defaults.md). Guest persistence, image-processing implementation and lifecycle remain separate dependencies. |

## Starting acceptance examples

Add more examples as sketches clarify behavior. These describe outcomes, not a
required screen sequence, and have not yet been implemented as application tests.

| Scenario | Expected outcome |
| --- | --- |
| A logged-out visitor opens a password-protected template without a valid access grant. | Its images are not visible before successful password entry, including through direct image requests. |
| A visitor refreshes the same list five times using the same viewer identifier. | Its unique-view count increases only once for that identifier, once processing completes. |
| The queue retries the same view event. | The unique-view count does not increase again. |
| A user moves an image to another tier, successfully saves, and reloads. | The image remains in the saved position. |

## Starting delivery milestones

Milestones are usable increments for the owner and coding agents, not separate team
assignments. Their order and boundaries can change as sketches reveal dependencies.
No dates are committed.

| Milestone | Initial completion criterion |
| --- | --- |
| 1. Foundation | A deployed app can apply/query its database migrations, establish an auth session, and demonstrate an image upload. Resolve runtime risks with the checks below. |
| 2. Core product | Create a template, rank its items, save, reload, and publish successfully, following the eventual sketches and agreed access rules. |
| 3. Sharing | Share links, embeds, image downloads, and “make your own” work, including protected-content cases. |
| 4. Discovery and social | Popularity, consensus, likes, friendships, profiles, and their privacy rules work against agreed examples. View counting is integrated before discovery depends on it. |
| 5. Launch readiness | Privacy checks, representative load tests, monitoring, and recovery verification meet the agreed launch criteria. |

## Provisional performance, cost, and recovery targets

The owner accepted these as a starting point. They are planning targets, not measured
results or guarantees. Confirm load/network conditions and budget scope before using
them as launch acceptance gates.

| Area | Starting target | Still to define or verify |
| --- | --- | --- |
| Editor response | Dragging responds locally without waiting for the server. | Representative devices, template sizes, and touch/keyboard behavior. |
| Save speed | 95% of saves complete within one second. | Measure end-to-end from save request to durable success; agree normal/peak load and network conditions. Debounce time is separate. |
| Count freshness | Accepted views appear in displayed counts within two minutes during normal operation. | Include queue processing and display-cache delay; define failure/backlog recovery behavior separately. |
| Monthly operating cost | Aim for $25/month at launch, with alerts before exceeding it. | Define expected traffic, included services, alert threshold, and response. An alert is not a hard spending cap. |
| Recovery time | Restore service within four hours of a serious failure. | Define failure scenarios and prove the procedure; this is a recovery objective, not an uptime guarantee. |
| Acceptable data loss | Published lists must be recoverable to an agreed point before failure; view analytics may tolerate more loss. | No numeric data-loss window has been chosen. Set it separately for application data, media, and analytics. |

## Foundation implementation checks

These checks can be handled as small owner/agent tasks while product decisions are
resolved. They do not require a separate team setup or implementing the whole app
in advance. Checks for later features can accompany the relevant milestone.

1. Pin the SvelteKit/Workers toolchain and dependency versions. Prove a minimal
   deployed page, D1 migration/query/transaction, and representative auth session.
2. Prove one upload, thumbnail, downloaded tier-list image, social preview, and embed
   through the chosen image/rendering path. Test a protected image as well as a public
   one. R2 storage alone does not implement image transforms or rendering.
3. Prove queue retries cannot inflate unique counts, simultaneous view inserts are
   safe, and failed/poisoned events are observable and recoverable. Decide how total
   events will be deduplicated if that metric is retained.
4. Turn the draft SQL into ordered migrations after access/lifecycle/auth decisions;
   rerun storage measurements when those choices change the schema materially.
5. Refine the provisional targets above with expected normal/peak load and measurable
   conditions for editor response, page/API latency, count freshness, monthly spend,
   and recovery/data-loss tolerance.
   Test representative indexed queries and contention on actual D1. No unsupported
   performance promise should be inferred from the local storage benchmark.
6. Establish isolated development/staging/production bindings, CI checks, secrets,
   deploy/migration rollback, database and media recovery procedures, error/queue
   monitoring. The project owner operates the app with agent assistance; no separate
   operations team is assumed. Account/domain access is required for
   deployment work; no resources have been provisioned during the design phase.

## Working readiness checklist

- [x] Product spec, brand assets, architecture direction, draft schema, and storage evidence exist.
- [x] Launch counting approach and future scaling options are distinguished.
- [x] Initial acceptance examples, milestones, and provisional targets are recorded.
- [x] Delivery model is the project owner plus coding agents.
- [ ] Product decisions above are recorded in an updated spec/access matrix.
- [ ] Framework/auth choices and Workers compatibility are confirmed by the foundation milestone.
- [ ] Owner's sketches are incorporated, with concise notes for behavior not visible
  in drawings: permissions, loading/empty/error states, save recovery, and accessibility.
  Sketches 01–03 (sidebar/profile, Feed, Templates) are incorporated; more remain in progress.
- [ ] Acceptance examples expand alongside each milestone; specific agent tasks
  identify their relevant sketches, expected behavior, dependencies, and checks.
- [ ] Target conditions, budget scope, numeric data-loss tolerance, environment
  configuration, and recovery checks are settled before launch.

Current readiness: enough context for scoped foundation tasks once implementation
is requested. UI flows await the owner's sketches; unresolved product choices can
be settled before the affected work. An exhaustive handoff package, HLL, distributed
counters, and speculative high-scale infrastructure are not prerequisites.

## Platform references

Checked September 30, 2026:

- [SvelteKit on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/)
- [Workers Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [D1 database API and batches](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [Queue delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/)
- [HyperLogLog size/accuracy example](https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/)
