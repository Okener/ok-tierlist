<script lang="ts">
 import { templates, lists } from '$lib/demo';
 import Avatar from '$lib/components/Avatar.svelte';
 import Preview from '$lib/components/Preview.svelte';
 let visible = $state(3);
 const activity = [
 {actor:'Juniper and Milo',verb:'liked a list', card:lists[0], time:'Today · 10:42 AM'},
 {actor:'Milo',verb:'published a list',card:{...lists[1],author:'Milo'},time:'Today · 9:18 AM'},
 {actor:'Juniper',verb:'shared a template',card:templates[2],time:'Yesterday · 4:30 PM'},
 {actor:'Bea',verb:'liked a list',card:lists[3],time:'Yesterday · 2:10 PM'},
 {actor:'Robin',verb:'published a list',card:{...lists[4],author:'Robin'},time:'Monday · 11:20 AM'}
 ];
</script>
<svelte:head><title>Feed · OK Tierlist</title></svelte:head>
<div class="page-heading"><div><p class="eyebrow">IN GOOD COMPANY</p><h1>Feed</h1><p class="muted">Your friends’ latest lists, templates, and likes.</p></div></div>
<div class="feed">{#each activity.slice(0,visible) as event}<article class="activity"><div class="activity-heading"><Avatar name={event.actor} /><div><p><strong>{event.actor}</strong> {event.verb}</p><p class="small muted">{event.time}</p></div></div><Preview items={event.card.items} /><div class="activity-copy"><h2>{event.card.title}</h2><p>by {event.card.author}</p>{#if event.card.kind === 'list'}<p class="muted small">From {event.card.template} · Template by {event.card.templateAuthor}</p>{/if}</div></article>{/each}
{#if visible < activity.length}<div class="load-more"><button onclick={() => visible += 3}>Load more</button></div>{/if}</div>
