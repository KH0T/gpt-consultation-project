import { useEffect, useRef, useState } from 'react';
import { mountVueChat } from './vue/mountVue';

function App() {
  const vueContainer = useRef(null);
  const [userId, setUserId] = useState('');
  const [chatReady, setChatReady] = useState(false);

  useEffect(() => {
    if (vueContainer.current && chatReady) {
      mountVueChat(vueContainer.current);
    }
  }, [chatReady]);

  const startSession = async () => {
    if (!userId.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    const data = await res.json();
    localStorage.setItem('sessionId', data.sessionId);
    localStorage.setItem('userId', userId);
    alert(`세션 시작됨: ${data.sessionId}`);
    setChatReady(true);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🧠 GPT 상담 시스템</h1>

      {!chatReady && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            placeholder="닉네임 입력"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ padding: '0.5rem', marginRight: '0.5rem' }}
          />
          <button onClick={startSession}>🟢 상담 시작</button>
        </div>
      )}

      <div ref={vueContainer} style={{ marginTop: '2rem' }}></div>
    </div>
  );
}

export default App;
