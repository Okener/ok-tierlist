<script lang="ts">
 import { createAvatar } from '@dicebear/core';
 import * as shapes from '@dicebear/shapes';
 let { name, large = false } = $props<{ name: string; large?: boolean }>();
 let src = $derived(createAvatar(shapes, { seed: name }).toDataUri());
</script>
<img class:large class="avatar" {src} alt="" width={large ? 104 : 36} height={large ? 104 : 36} />
<style>.avatar{border-radius:12px;flex-shrink:0;background:var(--surface-alt)}.large{border-radius:22px}</style>
