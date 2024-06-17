<script setup>
import { ref, onMounted } from 'vue';
import { createApp } from 'whyframe:app';
import { NMessageProvider } from 'naive-ui';

function trackColorScheme() {
  let prevTheme = null;

  window.addEventListener('storage', () => {
    let theme = localStorage.getItem('vitepress-theme-appearance');
    if (theme === prevTheme) return;
    prevTheme = theme;

    if (theme === 'auto') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  });
}

const el = ref();
onMounted(() => {
  trackColorScheme();
  createApp(el.value);
});
</script>

<template>
  <NMessageProvider>
    <div id="vp-app" ref="el"></div>
  </NMessageProvider>
</template>

<style scoped>
#vp-app {
  width: 100%;
  height: 100vh;
  padding: 0.5rem;
}

.dark #vp-app {
  color: #efefef;
  background-color: #2b2b2b;
}
</style>
