import { createApp } from 'vue';
import VueChat from '../components/VueChat.vue'; 
export function mountVueChat(el) {
  console.log('✅ Vue 마운트 시작됨');
  const app = createApp(VueChat);
  app.mount(el);
}


