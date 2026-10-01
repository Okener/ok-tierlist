# Sketch 01: sidebar and profile

Source: [IMG_3498.HEIC](../../IMG_3498.HEIC), supplied by the owner September 30, 2026.

- [Browser/agent-readable PNG of the original](01-sidebar-profile-source.png)
- [Clean schematic SVG](01-sidebar-profile-wireframe.svg)
- [Clean schematic PNG preview](01-sidebar-profile-wireframe.png)

The PNG is a format conversion of the original photograph. The SVG is a manually
transcribed layout reference, not a proposed visual redesign or an implemented UI.
Use this text for behavior and confidence; use the source to resolve ambiguity.
Spacing, colors, precise sizing, example counts, and card counts are not specifications.

Owner clarifications, September 30, 2026: manual featured-list selection is supported;
row arrows page by the number of cards that fit the width, with a previous arrow when
not at the beginning; a Likes row appears below Lists. Featured selections must be
lists the user created. The sidebar pushes page content. Accessibility should follow
standard good practice rather than requiring the owner to invent a settings panel.
These clarifications override
the omissions/ambiguities in the original photograph and are included in the wireframe.

## What is clearly shown

The page contains two drawings: sidebar/navigation notes above a separator, and a
profile layout below. Do not interpret the separator as part of the application.

### App navigation

The header shows a hamburger icon followed by the brand/title, read as “OK Tierlist.”
The handwritten note says the sidebar slides out from the hamburger.

| Navigation label | Destination or purpose in the sketch | Confidence |
| --- | --- | --- |
| Me | Profile page; a small person/avatar symbol is beside the label. | Clear |
| Feed | Friends' templates, lists, and likes. | Supported by the [feed sketch](02-feed.md); event ordering/grouping being clarified. |
| Templates | Browse popular templates and create your own. | Handwriting read this way; “create own” wraps onto the next line. |
| Settings | Privacy, dark mode, accessibility. | Clear |

These are four destinations in this order. The owner confirmed a push sidebar,
not an overlay. Logged-out menu contents and exact responsive/close behavior are
not drawn. Use a keyboard-operable menu toggle with visible focus, an accessible name
and expanded state; support reduced motion and prevent off-screen menu focus when
closed. Do not infer an additional mandatory settings panel from “accessibility.”

### Profile content, top to bottom

1. **Profile header:** a large square avatar on the left; a username/display name on
   the right, with an inline summary underneath. The sample appears to read
   “Mourning Dove 096,” with “9 friends · 1 template · 16 lists.” The name's spelling
   is uncertain and these values are illustrative. Crossed-out writing after the
   counts is intentionally not transcribed as a requirement.
2. **Featured list:** a wide block below the header, labeled “featured list
   (default: most liked).” The owner confirmed manual featured-list selection as well.
   Only lists created by that user are eligible. Feature on profile selects a list;
   Use most-liked resets. Deleted/unavailable selections fall back to most-liked.
3. **Friends:** a heading, a horizontal row of roughly four avatar/card placeholders,
   and a rightward affordance.
4. **Templates:** a heading, a horizontal row of roughly four card placeholders,
   and a rightward affordance.
5. **Lists:** a heading, a horizontal row of roughly four card placeholders,
   and a rightward affordance.
6. **Likes:** a collection row below Lists, explicitly added in the owner's follow-up.

Preserve this section order. Each next arrow shows the next N cards, with N determined
by the screen width's visible card capacity. Show a previous arrow whenever not at
the beginning; it returns to the preceding group. Four drawn cards are illustrative,
not a fixed count. The original photograph omits Likes; the updated wireframe includes it.

Confirmed: hide Next at the end and support touch swipes. Templates/Lists are
newest-first, Likes by newest like activity, and Friends alphabetical. On another
profile show Add friend, Request sent, Accept request, or Remove friend as appropriate.
Omit privacy-hidden sections and their corresponding counts entirely.

If no eligible list exists, hide the featured block. Break most-liked ties by choosing
the newest list. These are confirmed defaults, not pending questions.

## Relationship to the existing spec

| Topic | Implementation guidance |
| --- | --- |
| Profile identity and avatar | Keep the uploaded-avatar/Dicebear fallback from the spec. Treat the sketch's name/counts as sample data. |
| Featured list | Own lists only; Feature on profile selects, Use most-liked resets, deleted/unavailable selections fall back to most-liked eligible content. |
| Friends, templates, lists | Use the sketched hierarchy and rows; adapt counts and content to the final authorization rules. |
| Profile privacy | Existing defaults still apply: created content public, liked lists friends-only, friends list friends-only. Omit hidden sections and their counts; do not show a Private placeholder. |
| Liked lists | Confirmed as the Likes row below Lists; retains the friends-only default. |
| Feed | See [feed notes](02-feed.md). The new sketch shows liked-list, list-publication, and template-sharing cards; newest-first order and per-list, per-day grouped likes are confirmed. Do not infer notifications or real-time updates. |
| Templates destination | Cards start ranking directly; Create template is above the grid; View consensus is a separate card action. |
| Settings | Privacy and theme remain. Owner delegates standard accessibility implementation: keyboard operation, labels, focus, readable contrast, and reduced motion. No custom accessibility panel is required without a concrete need. |
| Theme and brand | Retain system-default light/dark behavior, existing Okener logo assets, and the exact footer text from the spec. Their omission/detail level in the drawing is not a removal. |

The storage benchmark schema predates manual featured-list selection and does not yet
persist it. Add a nullable selection reference or equivalent in the implementation
migration enforcing the confirmed ownership/fallback rules. Do not claim this feature is
already supported by the schema. Profile counts can be derived from existing records;
any cached values must respect access policy. Feed event storage awaits its semantics.

## Agent implementation notes

- This is design preparation; the owner is still sketching. Do not scaffold the
  application or finalize a complete screen flow merely from this reference.
- Keep the hamburger/menu, identity header, featured list, and four collection rows
  as distinct UI responsibilities. This is a suggested component boundary, not a
  requirement for particular filenames or a component library.
- A template card represents a reusable template; a list card represents someone's
  ranking. Do not conflate them just because both are rectangles in the drawing.
- Use current viewer permissions for rows, counts, and the featured list. Rendering
  an empty container or hiding a row is not a substitute for server authorization.
- When implemented, menu controls and collection navigation need accessible names,
  keyboard/focus behavior, and touch support. The drawing does not settle their styling.
- Empty states, loading/error states, visitor-versus-owner actions, and responsive
  layouts should be resolved as those tasks arise, without adding unnecessary steps.

## Acceptance examples to refine during implementation

These supplement the existing architecture examples; they do not imply completed tests.

- Activating the hamburger reveals the navigation in the sketched order: Me, Feed,
  Templates, Settings. Each label has a usable text/accessibility name.
- On a profile where the viewer is allowed to see all shown sections, content follows
  this order: identity/counts, featured list, Friends, Templates, Lists, Likes.
- When the owner manually selects an eligible featured list, that selection is shown
  instead of the automatically most-liked list and persists across reloads.
- If N cards fit, Next reveals the next N cards. Previous is absent at the start
  and appears after advancing. Next is absent at the end; touch swiping also works.
  Card capacity adapts to available width.
- With published lists having different like counts, the default featured selection
  is the most-liked eligible list. Equal like counts select the newest list; with no
  eligible list the featured block is hidden. Selection still respects ownership/access.
- Resetting the selected featured list restores most-liked behavior; deleting it
  falls back to the most-liked eligible remaining list.
- A privacy-hidden section and its corresponding count are both omitted.
- Another profile shows the relationship-appropriate friend control.
- A missing uploaded avatar uses the established Dicebear fallback.
- Restricted profile content is not exposed by its cards, summaries, counts, or media
  contrary to the eventual access matrix. Tests must include owner, friend, stranger,
  and logged-out cases once the matrix is agreed.

## Clarification status

The surfaced profile questions are answered and incorporated above. Standard
accessibility and routine responsive mechanics are delegated implementation details.
Broader product questions, such as guest sign-in and direct-link authorization, remain
in the architecture decision list; they were not settled by this sketch discussion.
Surface further consequential ambiguity to the owner rather than silently parking it.
