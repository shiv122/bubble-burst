// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  plugins: [
    { src: "~/plugins/mojs.js", mode: "client" },
    { src: "~/plugins/vuekonva", mode: "client" },
    { src: "~/plugins/phaser.js", mode: "client" },
    { src: "~/plugins/vue-flow.js", mode: "client" },
  ],
  css: ["~/assets/css/main.css",'@vue-flow/core/dist/style.css'],
  tailwindcss: {
    theme: {},
  },
  build: {
    transpile: ["vuekonva"],
  },

  modules: ["@nuxt/ui", "@vueuse/nuxt"],
});
