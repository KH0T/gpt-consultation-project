import { createApp } from 'vue';
import VueChat from '../components/VueChat.vue';

export function mountVueChat(el) {
  const app = createApp(VueChat);
  app.mount(el);
}