import Phaser from 'phaser';

export default defineNuxtPlugin({
  setup(nuxtApp) {
    nuxtApp.provide('phaser', Phaser);
  }
});