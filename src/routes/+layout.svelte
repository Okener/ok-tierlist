<script lang="ts">
 import '../app.css';
 import { page } from '$app/state';
 let { children } = $props();
 let open = $state(false);
 const nav = [{href:'/me', label:'Me', icon:'◉'}, {href:'/feed', label:'Feed', icon:'▤'}, {href:'/templates', label:'Templates', icon:'▦'}, {href:'/settings', label:'Settings', icon:'⚙'}];
</script>
<svelte:head><title>OK Tierlist</title><meta name="description" content="Make room for your opinions. Create, rank, and share tier lists." /></svelte:head>
<a class="skip-link" href="#main">Skip to content</a>
<header class="app-header"><button class="menu-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="navigation" onclick={() => open = !open}>☰</button><a class="brand" href="/templates"><img src="/ok-logo.svg" alt="Okener" width="40" height="28" /><span>Tierlist</span></a><span class="preview-label">Layout preview</span></header>
<div class="app-body" class:sidebar-open={open}>
<aside id="navigation" inert={!open} aria-hidden={!open}><nav aria-label="Main navigation">{#each nav as item}<a href={item.href} aria-current={page.url.pathname === item.href ? 'page' : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</a>{/each}</nav></aside>
<div class="page-column"><main id="main"><div class="demo-note">A look around OK Tierlist · Sample profiles, lists, and activity</div>{@render children()}</main><footer>© 2026 Okener Enterprises, LLC</footer></div>
</div>
