1. Users should be able to create and share tier list templates. Templates consist of an empty rack of tiers (see @tierlist_example.png) and a pool of images below.

1a. Users should be able to mark their template as public, unlisted, or password-protected.

1a-i. Password-protected templates always require the password, including when accessed through a direct link. Direct links do not bypass password protection.

1a-ii. Derived lists inherit their template's privacy settings. Lists made from password-protected templates cannot be embedded.

1b. Users should be able to customize the number of rows and the label of each row when creating a template.

2. Users should be able to upload their own images when creating templates.

3. Users should be able to make their own tier lists from templates.

4. When making a tier list, users should be able to click and drag images from the unranked pool to and from the different tiers.

5. Users should be able to share their tier list to social media, or as an embed, or download an image.

6. When people view a tier list in an embed or through a share link, they should be able to create their own tier list from the same template with one click.

6a. On the Templates page, clicking a template card should start ranking immediately. A Create template button should appear above the grid.

7. The application should track how many unique views each tier list receives.

8. The application should track the total views of all tier lists from a template.

9. The application should track the number of tier lists made from each template.

10. Users should be able to discover templates by popularity. Popularity should factor in total views and total tier lists, with a log decay over time.

10a. Users can only discover publicly listed templates through this feature, not unlisted or password-protected

11. Users should be able to like a tier list. Likes should not affect the parent template's popularity.

12. Users should be able to view the "consensus tier list" for any template, based on an average of each item's position, weighted by likes.

12a. Template cards should offer View consensus as a separate action from the primary action of starting a ranking.

13. Users should have a profile.

14. User profiles should show all created tier lists and templates. This should be public by default, but with an easy toggle to make it friends only or private.

15. User profiles should show all liked tier lists. This should be friends only by default, with an easy toggle to make it public or private.

15a. The profile's collection sections should appear in this order: Friends, Templates, Lists, Likes. Likes appears below Lists.

15b. Each collection row should show as many cards as fit the available screen width. Its next arrow should show the next N cards, where N is the visible card count. A previous arrow should appear whenever the row is not at the beginning.

15c. Templates, Lists, and Likes rows should be newest-first; Friends should be alphabetical. Hide Next at the end of a row. Support touch swipes as well as arrows.

15d. When privacy settings hide a profile section from the viewer, omit both the section and its corresponding count.

16. Users should be able to friend request other users.

16a. On another user's profile, show the appropriate relationship control: Add friend, Request sent, Accept request, or Remove friend.

17. User profiles should show a friends list. THis should be friends only by default, with an easy toggle to make it public or private.

18. User profiles should show a profile picture.

18a. If a user hasn't uploaded a profile picture yet, use Dicebear to generate a unique placeholder.

19. User profiles should highlight their most-liked tier list.

19a. Users should also be able to manually select their featured list from lists they created; most-liked is the default selection.

19b. Offer Feature on profile on the user's own lists and Use most-liked to reset the selection. If a selected list is deleted or unavailable, fall back to the most-liked eligible list.

19c. If no eligible lists exist, hide the featured block. If most-liked lists tie, choose the newest.

20. The site should feature light and dark modes, defaulting to the system preference.

21. The site should be snappy and responsive.

22. The user interface should be clean, clear, consistent, and unpretentious.

23. The site should use the Okener Enterprises logo (see folder) and feature only the text "© 2026 Okener Enterprises, LLC" in the footer.

24. The hamburger navigation should open a sidebar that pushes page content, with destinations in this order: Me, Feed, Templates, Settings.

25. The Feed should show friends' newly published lists, newly published templates, and likes, ordered newest activity first. Likes of the same list should be grouped. List cards should retain both list-author and originating-template attribution.

25a. Feed and Templates should both use a Load more button for additional content. In the Feed, sharing a template means publishing a new template, not a separate repost action.

25b. Group likes separately for each list on each day, rather than combining all days into one group.

25c. Use the viewer's local day for those groups and order each group by its newest like. Remove a friend's contribution if they unlike the list or make that activity private.

26. Provide standard accessibility support, including keyboard operation, visible focus, accessible labels, readable contrast, and reduced-motion support. Specific implementation details are delegated to the coding agents.

27. Support email sign-in. Guests may publish. The email mechanism (link, code,
    or password), guest draft storage, and guest ownership/recovery/claiming remain
    to be decided before implementing authentication and publishing.

28. Initial popularity and consensus formulas, editor flow, and upload limits are
    defined in [product defaults](docs/product-defaults.md), selected under owner
    delegation and intended to be revisited based on results.
