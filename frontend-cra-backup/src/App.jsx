import { useEffect, useRef } from 'react';
import { mountVueChat } from './vue/mountVue';

function App() {
  const vueContainer = useRef(null);

  useEffect(() => {
    if (vueContainer.current) {
      mountVueChat(vueContainer.current);
    }
  }, []);

  const startSession = async () => {
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user123' }) // 유저 고정 또는 로그인 연동 가능
    });
    const data = await res.json();
    localStorage.setItem('sessionId', data.sessionId);
    alert(`새 상담 세션이 시작되었습니다.\n세션 ID: ${data.sessionId}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧠 GPT 상담 시스템</h1>
      <button onClick={startSession}>🟢 상담 시작</button>

      <div ref={vueContainer} style={{ marginTop: '2rem' }}></div>
    </div>
  );
}

export default App;
