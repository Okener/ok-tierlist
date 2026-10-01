# App foundation — September 30, 2026

Implemented SvelteKit with TypeScript and the Cloudflare adapter for Workers.
The configuration follows the [Workers SvelteKit guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/).
D1 uses numbered SQL migrations and the native prepared-statement API; R2 has
server-only binding helpers. No media delivery/upload HTTP routes are exposed.
No authentication package has been selected while the email mechanism is pending.

The shell and `/me`, `/feed`, `/templates` layouts follow the three sketch notes.
`/settings` implements browser-local system/light/dark appearance. All content is
explicitly sample data. Profile rows page by visible card capacity and scroll on
touch; Feed and Templates append fixtures with Load more. Template ranking,
creation and consensus actions remain unavailable, rather than routing to invented
flows. The profile shown is a sample owner view; this is not a guest-access policy.

## Database boundary

`db/schema.sql` and storage measurements remain unchanged. `migrations/0001_initial.sql`
adapts that baseline without its placeholder auth tables. Existing list ownership
is account-based: the approved guest publishing decision requires a deliberate
migration once guest ownership is specified, before any publish endpoint exists.
The structural schema does not authorize template edits or finalize lifecycle rules.
`0002_profile_feature.sql` enforces featured-list ownership with a composite foreign
key and clears selections on list deletion. Runtime eligibility, fallback, and
selection persistence are not yet wired into the demo profile.

## Decisions before dependent work

- **Approved:** email sign-in; guests may publish. Passwords are required for
  password-protected templates even through direct links. Derived lists inherit
  template privacy. Lists made from password-protected templates cannot be embedded.
- **Authentication:** choose email link/code/password and guest draft persistence,
  ownership, recovery, claiming, and permissions for likes/friend requests.
- **Access still open:** profile privacy versus direct resource links; exact media,
  preview, download and consensus authorization; password grant duration/re-entry;
  propagation and cache invalidation when template privacy changes. Direct links
  must never bypass passwords, derived lists inherit template privacy, and
  password-protected template lists have no embed path.
- **Lifecycle:** edits to template items/tiers after use; versioning/deletion policy.
- **Defaults chosen under owner delegation:** [ranking formulas, editor flow, and
  upload limits](product-defaults.md). These no longer await product selection;
  authorization, lifecycle, guest ownership and processing dependencies still apply.

Questions were surfaced in the implementation conversation. The owner delegated formula, editor-flow and upload-limit defaults; other
remaining answers have not been inferred. Feed activity storage, authorization,
view counting, ranking formulas, and editor/upload behavior are deferred.

## Verification

- Seven schema/migration tests pass, including cross-owner feature rejection and
  selection cleanup on deletion.
- Svelte check: no errors or warnings. Production Workers build passes.
- Both migrations applied through local Wrangler D1.
- Local Cloudflare bindings: D1 schema lookup and R2 write/read/metadata/delete pass.
- Dependency audit reports zero advisories after patched cookie/undici overrides;
  retain these until upstream dependency ranges incorporate the fixes.
- Browser automation has no available browser connection in this session. Visual,
  touch, focus, responsive, and hydrated interaction checks remain outstanding.
- No remote resources created, remote migrations run, or deployment performed.
