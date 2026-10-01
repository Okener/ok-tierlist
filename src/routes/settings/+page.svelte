<script lang="ts">
 import { onMount } from 'svelte';
 let theme = $state('system');
 onMount(() => { try { theme = localStorage.getItem('theme') || 'system'; } catch {} });
 function change() { document.documentElement.dataset.theme = theme; try { localStorage.setItem('theme',theme); } catch {} }
</script>
<svelte:head><title>Settings · OK Tierlist</title></svelte:head>
<div class="page-heading"><div><p class="eyebrow">FEEL AT HOME</p><h1>Settings</h1></div></div>
<section class="settings-panel"><h2>Appearance</h2><p class="muted">Choose a theme for this browser.</p><label for="theme">Theme</label><select id="theme" bind:value={theme} onchange={change}><option value="system">Use device setting</option><option value="light">Light</option><option value="dark">Dark</option></select></section>
