<script lang="ts">
 import { templates } from '$lib/demo';
 import Card from '$lib/components/Card.svelte';
 let visible = $state(6);
</script>
<svelte:head><title>Templates · OK Tierlist</title></svelte:head>
<div class="page-heading"><div><p class="eyebrow">MAKE IT YOUR OWN</p><h1>Templates</h1><p class="muted">A starting point for every opinion.</p></div><button class="primary" disabled title="Template creation is coming in the editor pass">＋ Create template</button></div>
<p class="small muted">Sample collection. Ranking and consensus will be available in a future pass.</p>
<div class="template-grid">{#each templates.slice(0, visible) as card}<Card {card} />{/each}</div>
{#if visible < templates.length}<div class="load-more"><button onclick={() => visible += 6}>Load more</button></div>{/if}
