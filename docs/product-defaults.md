# Initial ranking, editor, and upload defaults

September 30, 2026. The owner delegated these choices as reasonable starting
points to revisit after observing results. These are accepted implementation
defaults, not claims that the features are already built. Keep formulas and limits
centralized and versioned when implemented; retain raw inputs so scores can be rebuilt.

## Template popularity — version 1

Only public templates participate. For a template:

- `L`: current published derived-list count (drafts excluded).
- `V`: sum of lifetime unique observed-viewer counts of those published lists.
  This is not a deduplicated audience across the template. A viewer of two lists
  can contribute twice. Raw repeated page loads do not increase this input.
- `d`: nonnegative age in days since the template was first published. Editing
  does not reset its age.
- `score = (ln(1 + V) + 3 * ln(1 + L)) / (1 + ln(1 + d / 7))`.

Likes do not enter popularity. Recompute every 15 minutes initially. Sort descending
by score, then first publication time, then stable ID. An unused, unseen template
scores zero. With 100 views and 10 lists, the score is about 11.81 at day zero,
6.97 at day seven, and 4.76 at day 28. This deliberately gives list creation more
influence than viewing and reduces the advantage of very large raw counts.

View acceptance, abuse filtering, viewer identity, and guest-to-account behavior
still need their own implementation rules; this formula does not settle them.
Persist first-publication timestamps in a migration before using this formula.

## Consensus — version 1

Use the current revision of published lists from the same template structure.
Exclude drafts and unranked items; missing placements are not bottom-tier votes.
Include one contribution per published list initially. Guest lists participate.
Revisit duplicate-list influence after guest identity and abuse controls are defined.

For each ranked item, use its zero-based tier index (top tier = 0) and weight
`1 + sqrt(current_like_count)`. This gives zero-like lists a vote while damping
large like counts. Compute the weighted mean independently for each item. Ignore
within-tier horizontal order. Assign the item to the nearest tier, breaking an
exact half-tier tie toward the lower tier (larger index). Within a resulting tier,
sort by weighted mean ascending, then original template pool order. An item with
no ranked contributions stays in the unranked pool.

Example: tier indices 0 and 2, with 0 and 9 likes, have weights 1 and 4. Their
mean is 1.6, placing the item in tier index 2. If both lists have zero likes,
the mean is 1 and the item goes in tier index 1.

Recompute on a 15-minute schedule initially. Publication, unpublication, ranking
edits, deletion, likes and unlikes invalidate the relevant aggregate. A restricted
list must not disclose its contribution through an unauthorized consensus response.
Exact access eligibility remains dependent on the access matrix. Never combine
incompatible template versions; lifecycle/versioning remains a separate decision.

## Editor flow

Template creation is one workspace: title, optional description, tier labels and
colors, and an image pool. Start with S/A/B/C/D; let creators add, remove, rename,
recolor, and reorder rows while creating. Choose visibility and explicitly publish
when validation passes. Do not require a wizard or a consensus/detail-page detour.

Clicking a template opens the ranking workspace directly, after any required
password check. Begin with every item unranked. Allow dragging between tiers and
the pool and reordering within a tier. Provide keyboard-accessible move controls
as an alternative to dragging. Include a title and a separate Publish action;
allow partial rankings with unranked items. Guests may publish as already approved.
Show saving/saved/error status wherever persistence is implemented. Guest storage,
ownership, recovery and sign-in timing remain pending; this flow does not pick them.

## Initial limits

| Setting | Default |
| --- | --- |
| Items per template | 1–100 |
| Tiers per template | 2–10; initially S/A/B/C/D |
| Template/list title | 1–100 Unicode code points after trimming |
| Tier label | 1–40 Unicode code points after trimming |
| Item label | 1–100 Unicode code points; initially derived from filename, editable |
| Template description | Up to 2,000 Unicode code points |
| Item upload formats | Static JPEG, PNG, WebP |
| Per-file encoded size | Up to 5 MiB |
| Per-template total input image bytes | Up to 50 MiB |
| Source dimensions | Each side at most 4,096 pixels; at most 16 million pixels total |
| Concurrent uploads | 3 |
| Stored item rendition | Fit within 512 × 512 without upscaling or cropping; preserve aspect ratio |
| Card thumbnail | Fit within 160 × 160; preserve aspect ratio |
| Download format | PNG; access enforcement required |

Validate size and decoded format/dimensions server-side; browser checks are only
feedback. Reject animated images, SVG and other formats for now. Decode/re-encode
accepted images and remove metadata; choose a Workers-compatible processing path
before enabling uploads. Do not expose source objects through public bucket URLs.
Apply template access to every delivered rendition; password-template lists have
no embed path. Account/storage quotas and retention are separate from these
per-template limits and remain future implementation decisions.

Examples: a 5 MiB PNG within the dimension limits is accepted; a 5 MiB + 1 byte
image is rejected with a size message. A 101st item is rejected without losing
existing items. A failed image can be retried individually; it does not clear the
rest of the creation workspace. Validate limits again before publication.
