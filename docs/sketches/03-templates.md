# Sketch 03: Templates

Source: [IMG_3500.HEIC](../../IMG_3500.HEIC), supplied September 30, 2026.
[Source PNG](03-templates-source.png) · [Clean SVG](03-templates-wireframe.svg) · [Clean PNG](03-templates-wireframe.png).

## Clearly shown

- “Templates” heading.
- A grid of preview cards, drawn two across and two down.
- Each card has a large preview above a template title and creator attribution.
- Sample titles appear to include “Italian Food” and “Mob Movies”; names are sample
  content rather than required UI copy. Lower-card text is schematic.

The four cards do not specify a data limit. The sketch shows two columns but does
not require two columns at every width. Keep this grid distinct from the profile's
explicitly paged horizontal collection rows and the feed's vertical activity stream.

## Existing requirements that still apply

- Discovery is popularity-based, with views/list creation and logarithmic time decay,
  excluding likes as a popularity factor. The exact formula is still open.
- Only public templates participate in discovery. Unlisted/password-protected
  templates must not leak through grid cards or images.
- Sidebar sketch 01 says this destination supports both browsing and template creation.
  The owner has now confirmed a Create template button above the grid.
- Clicking a template card starts ranking immediately; do not add a mandatory detail/
  consensus page before the editor. View consensus is a separate action on template
  cards, confirmed by the owner; it must not also trigger the primary ranking action.
- Do not infer search, filters, categories, or extra navigation from an unlabeled grid.

## Confirmed owner clarifications

Confirmed: a Load more button fetches additional templates.

Confirmed: View consensus is a separate action on template cards.

## Starting acceptance examples

- Public template cards show their preview, title, and creator attribution.
- Unlisted and password-protected templates do not appear in discovery results.
- The grid adapts to the viewport without treating four drawn examples as a fixed limit.
- Clicking a template card opens its ranking editor directly.
- Create template is available above the grid.
- View consensus opens the consensus view without starting a ranking.
- Load more appends additional eligible templates to the grid.

These are planning examples, not implemented tests. The creation form itself is not
specified by this grid sketch.
