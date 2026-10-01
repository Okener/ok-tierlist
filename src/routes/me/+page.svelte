<script lang="ts">
 import { templates, lists, friends } from '$lib/demo';
 import Avatar from '$lib/components/Avatar.svelte';
 import Card from '$lib/components/Card.svelte';
 import Collection from '$lib/components/Collection.svelte';
 import Preview from '$lib/components/Preview.svelte';
</script>
<svelte:head><title>Me · OK Tierlist</title></svelte:head>
<section class="profile-heading"><Avatar name="Mourning Dove" large /><div><p class="eyebrow">YOUR PROFILE</p><h1>Mourning Dove</h1><p class="muted">9 friends · 10 templates · 10 lists</p></div></section>
<section class="featured"><div class="section-heading"><h2>Featured list</h2><span class="pill">Most liked</span></div><Preview items={lists[0].items} /><h3>{lists[0].title}</h3><p class="muted">by Mourning Dove · From {lists[0].template} by {lists[0].templateAuthor}</p></section>
<Collection title="Friends">{#each friends as name}<div class="friend-card"><Avatar {name} large /><h3>{name}</h3></div>{/each}</Collection>
<Collection title="Templates">{#each templates as card}<Card {card} />{/each}</Collection>
<Collection title="Lists">{#each lists as card}<Card {card} />{/each}</Collection>
<Collection title="Likes">{#each lists.toReversed() as card}<Card {card} />{/each}</Collection>
