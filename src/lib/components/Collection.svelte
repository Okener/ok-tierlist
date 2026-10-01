<script lang="ts">
 import { onMount } from 'svelte';
 import type { Snippet } from 'svelte';
 let { title, children } = $props<{title: string; children: Snippet}>();
 let track: HTMLDivElement;
 let previous = $state(false); let next = $state(false);
 function measure() { if(track) { previous = track.scrollLeft > 2; next = track.scrollLeft + track.clientWidth < track.scrollWidth - 2; } }
 function move(direction: number) {
  const child = track.firstElementChild as HTMLElement | null;
  if(!child) return;
  const step = child.getBoundingClientRect().width + 16;
  const count = Math.max(1, Math.floor((track.clientWidth + 16) / step));
  track.scrollBy({ left: direction * count * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
 }
 onMount(() => { const observer = new ResizeObserver(measure); observer.observe(track); measure(); return () => observer.disconnect(); });
</script>
<section class="collection"><div class="section-heading"><h2>{title}</h2><div class="arrows">{#if previous}<button aria-label={`Previous ${title}`} onclick={() => move(-1)}>←</button>{/if}{#if next}<button aria-label={`Next ${title}`} onclick={() => move(1)}>→</button>{/if}</div></div>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable region needs keyboard access.) -->
<div class="collection-track" bind:this={track} onscroll={measure} tabindex="0" role="region" aria-label={title}>{@render children()}</div></section>
