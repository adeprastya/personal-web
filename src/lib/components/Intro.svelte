<script lang="ts">
  let showIntro = true;

  setTimeout(() => {
    showIntro = false;
  }, 1500);
</script>

<div class="fixed inset-0 size-full flex items-center justify-center bg-zinc-200 transition-opacity duration-1000 pointer-events-none"
 style="opacity: {showIntro ? '1' : '0'};"
>
  <h1 class="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 font-heading text-[5.5rem] sm:text-[6rem] md:text-[7rem] lg:text-[10rem] xl:text-[12rem] tracking-tight leading-none text-zinc-950 text-shadow-lg">
    <span>Do</span>
    <span>It</span>
    <span>Yourself</span>
  </h1>
</div>
