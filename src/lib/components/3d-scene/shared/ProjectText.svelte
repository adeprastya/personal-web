<script lang="ts">
  import { Text } from "@threlte/extras";

  let { title, progress } = $props()

  let textColor = $derived.by(() => {
      const r = Math.round(255 * (1 - progress));
      const g = Math.round(255 * (1 - progress));
      const b = Math.round(255 * (1 - progress));
      return `rgb(${r},${g},${b})`;
  });

  let textOpacity = $derived(Math.max(0, 1 - progress * 0.005));
</script>

<Text
    text={title}
    position={[0, 0, 0.5]}
    font="/fonts/Canterbury/Canterbury.ttf"
    fontSize={0.2}
    anchorX="center"
    anchorY="middle"
    color={textColor}
    fillOpacity={textOpacity}
/>
