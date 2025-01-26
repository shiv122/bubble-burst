import mojs from '@mojs/core';

export default defineNuxtPlugin({
  name: 'mojs',
  setup(nuxtApp) {
    nuxtApp.provide('mojs', mojs);
  }
});