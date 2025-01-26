// plugins/vue-flow.js
import * as VueFlow from "@vue-flow/core";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueFlow);
});
