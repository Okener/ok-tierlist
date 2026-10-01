<script lang="ts">let { items, compact = false } = $props<{items: string[]; compact?: boolean}>();</script>
<div class="rack" class:compact aria-label="Sample tier list preview" role="img">
 {#each ['S', 'A', 'B', 'C'] as tier, i}<div class="tier"><span class="label" style={`background:var(--tier-${i})`}>{tier}</span><div class="items">{#each items.slice([0, 2, 4, 5][i], [2, 4, 5, 6][i]) as item}<span>{item}</span>{/each}</div></div>{/each}
</div>
<style>.rack{padding:16px;background:var(--surface-alt);border-radius:12px}.tier{display:flex;min-height:42px;border-bottom:2px solid var(--surface-alt);background:var(--surface)}.label{width:42px;display:grid;place-items:center;color:#262626;font-weight:750}.items{min-width:0;overflow:hidden;display:flex;align-items:center;gap:12px;padding:4px 12px;font-size:26px}.compact{padding:12px}.compact .tier{min-height:32px}.compact .label{width:32px}.compact .items{font-size:21px}</style>
