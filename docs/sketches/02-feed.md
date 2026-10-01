# Sketch 02: Feed

Source: [IMG_3499.HEIC](../../IMG_3499.HEIC), supplied September 30, 2026.
[Source PNG](02-feed-source.png) · [Clean SVG](02-feed-wireframe.svg) · [Clean PNG](02-feed-wireframe.png).

## Clearly shown

- Heading: “Feed (your friends' activity).”
- A vertical sequence of large activity cards, each containing a preview.
- A liked-list card has a top strip with an avatar and “[friend] likes,” followed
  by a list preview, list title and author, and the originating template and its author.
- A second card shows a list preview with list title/author and originating template/
  author. It is read as a friend's newly published list; the activity verb is not drawn.
- A template card shows a preview, “[friend] shared a template!”, and the template title.
- Sample topics appear to include cars, action movies, and Italian food. Usernames
  are illustrative and partly unclear, so the schematic uses role placeholders.

The three cards demonstrate content types, not a three-item feed limit. The feed's
single column is distinct from the Templates page's grid. Preserve both list authorship
and template authorship; the friend who likes a list may be neither author.

## Confirmed owner clarifications

Confirmed: friends' newly published lists, newly published templates, and likes;
newest activity first; likes are grouped separately per list per day. The same list
can therefore appear in different daily groups. This is included in the clean
wireframe. Days use the viewer's local timezone. Each group is ordered by its newest
like. Remove a friend's contribution when they unlike the list or hide that activity
through privacy settings. A group with no remaining visible contributions has no
activity to display; recalculate its timestamp from remaining contributions.

Confirmed: a Load more button fetches older activity. “Shared a template” means
publishing a new template, not a separate repost action.

## Implementation implications

The original numbered spec did not define a feed. Treat the new sketch as product
input, with newest-first ordering and grouped likes now confirmed. Do not invent following,
comments, reposts, notifications, or live refresh from the word “activity.”

Apply both actor activity visibility and target-resource authorization. A friend's
like must not disclose a protected list or an activity hidden by their liked-list
privacy setting. Exact visibility rules belong in the access matrix being clarified.

The existing schema stores lists, templates, likes, and timestamps; it does not yet
define a durable feed-event history. Querying current authorized likes naturally
supports removal on unlike/privacy change; an event-based implementation must apply
the same rule rather than expose historical private activity. The implementation
can select between these approaches using the now-confirmed product behavior.
Group using calendar boundaries in the viewer's timezone, including daylight-saving
changes, rather than fixed 24-hour UTC windows. Keep the timezone consistent across
Load more requests; do not share personalized grouped results in a public cache.
No schema or application implementation is included in this transcription.

## Starting acceptance examples

- A liked-list card distinguishes the liking friend, list author, and template author.
- A list card retains the originating template attribution.
- A template activity card identifies the template and the friend whose activity it is.
- The feed does not expose content the current viewer cannot access.
- Multiple friends liking the same list appear as grouped like activity rather
  than separate cards for each friend.
- Likes on one list on the same day group together; likes on that list on different
  viewer-local days form separate groups. Each group sorts by its newest like.
- Unliking or making liked activity private removes that friend's contribution;
  other visible contributions in the group remain.
- Load more appends older activity without replacing the currently loaded cards.
- Publishing a template generates its template activity; a separate repost action
  is not required.

These are planning examples, not implemented tests. The surfaced navigation and
grouping questions are answered. Broader access-policy decisions remain in the
architecture document; this reference does not silently settle them.
