---
layout: home

hero:
  name: 'Vitepress theme components'
  text: 'A vitepress theme for components site'
  actions:
    - theme: brand
      text: Guide
      link: /guide/start
    - theme: alt
      text: Demo Components
      link: /demo/

  image:
    src: /vitepress-logo-large.webp
    alt: VitePress

features:
  - icon: 💡
    title: Instant Server Start
    details: On demand file serving over native ESM, no bundling required!
  - icon: ⚡️
    title: Lightning Fast HMR
    details: Hot Module Replacement (HMR) that stays fast regardless of app size.
  - icon: 🛠️
    title: Rich Features
    details: Out-of-the-box support for TypeScript, JSX, CSS and more.
  - icon: 📦
    title: Optimized Build
    details: Pre-configured Rollup build with multi-page and library mode support.
  - icon: 🔩
    title: Universal Plugins
    details: Rollup-superset plugin interface shared between dev and build.
  - icon: 🔑
    title: Fully Typed APIs
    details: Flexible programmatic APIs with full TypeScript typing.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(40px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(72px);
  }
}
</style>
