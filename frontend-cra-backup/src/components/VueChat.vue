<template>
  <div class="vue-chat">
    <h3>💬 Vue 챗봇</h3>
    <input v-model="message" @keyup.enter="sendMessage" placeholder="메시지를 입력하세요" />
    <button @click="sendMessage">전송</button>
    <div v-for="(msg, i) in chatLog" :key="i">
      <p><strong>{{ msg.sender }}:</strong> {{ msg.text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: '',
      chatLog: []
    };
  },
  methods: {
    async sendMessage() {
      if (!this.message) return;
      const userId = 'user123';
      const sessionId = localStorage.getItem('sessionId');

      this.chatLog.push({ sender: '나', text: this.message });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId, message: this.message })
      });

      const data = await res.json();
      this.chatLog.push({ sender: 'GPT', text: data.reply });

      if (this.message.includes('대화 종료')) {
        localStorage.removeItem('sessionId');
        this.chatLog.push({ sender: '📌 시스템', text: '대화가 종료되었습니다.' });
      }

      this.message = '';
    }
  }
};
</script>

<style scoped>
.vue-chat {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}
input {
  padding: 0.5rem;
  width: 70%;
  margin-right: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>
