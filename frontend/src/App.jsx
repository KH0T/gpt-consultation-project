import { useEffect, useRef, useState } from 'react';
import { mountVueChat } from './vue/mountVue';

function App() {
  const vueContainer = useRef(null);
  const [userId, setUserId] = useState('');
  const [chatReady, setChatReady] = useState(false);
  const [summaryFeed, setSummaryFeed] = useState([]);

  useEffect(() => {
    if (vueContainer.current && chatReady) {
      mountVueChat(vueContainer.current);
    }
  }, [chatReady]);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const res = await fetch('/api/summary');
        const data = await res.json();
        setSummaryFeed(data);
      } catch (err) {
        console.error('요약 불러오기 실패:', err);
      }
    };
    fetchSummaries();
  }, []);

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

  const handleLike = async (id) => {
    try {
      await fetch(`/api/summary/${id}/like`, {
        method: 'POST'
      });
      setSummaryFeed(prev => prev.map(item => (
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      )));
    } catch (err) {
      console.error('공감 처리 실패:', err);
    }
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

      {!chatReady && summaryFeed.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>📰 전체 상담 요약</h2>
          <div>
            {summaryFeed.map((item, i) => (
              <div key={i} style={{ borderBottom: '1px solid #ccc', padding: '1rem 0' }}>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  👤 {item.user_id} • {new Date(item.created_at).toLocaleString()}
                </p>
                <p style={{ whiteSpace: 'pre-wrap' }}>{item.summary}</p>
                <button onClick={() => handleLike(item.id)} style={{ marginTop: '0.5rem' }}>
                  ❤️ 공감 {item.likes || 0}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      <div ref={vueContainer} style={{ marginTop: '2rem' }}></div>
    </div>
  );
}

export default App;
