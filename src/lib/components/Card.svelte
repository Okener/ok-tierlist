<script lang="ts">
 import type { Card } from '$lib/demo';
 import Preview from './Preview.svelte';
 let { card } = $props<{card: Card}>();
</script>
<article class="card">
 <Preview items={card.items} compact />
 <div class="card-copy"><h3>{card.title}</h3><p>by {card.author}</p>
 {#if card.kind === 'template'}<button class="text-button" disabled title="Consensus is not available in this layout preview">View consensus ↗</button>{:else}<p class="attribution">From {card.template} · {card.templateAuthor}</p>{/if}</div>
</article>
