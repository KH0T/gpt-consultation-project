import React, { useState, useEffect } from 'react';

function App() {
  const [userId, setUserId] = useState('');
  const [ready, setReady] = useState(false);
  const [summaryFeed, setSummaryFeed] = useState([]);
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([]);

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

  const handleSend = async () => {
    if (!input.trim() || !userId.trim()) return;

    const userMessage = input;
    setChatLog([...chatLog, { role: 'user', content: userMessage }]);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message: userMessage })
    });

    const data = await res.json();
    setChatLog(prev => [...prev, { role: 'assistant', content: data.reply }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <div className="space-y-4">
          <h1 className="text-xl font-bold">닉네임을 입력해주세요</h1>
          <input
            className="w-full border p-2 rounded"
            placeholder="예: jaeu"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button
            onClick={() => {
              if (userId.trim().length >= 2) {
                setReady(true);
              } else {
                alert("닉네임은 2자 이상 입력해주세요.");
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow"
          >
            상담 시작
          </button>
        </div>

        {ready && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">{userId} 님의 상담</h2>
            <div className="h-80 overflow-y-auto border p-4 mb-4 bg-gray-50 rounded">
              {chatLog.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  <p className="mb-2"><strong>{msg.role === 'user' ? '나' : 'GPT'}:</strong> {msg.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 border p-2 rounded"
                placeholder="고민을 입력하세요..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className="bg-blue-500 text-white px-4 py-2 rounded shadow"
              >전송</button>
            </div>
          </div>
        )}

        {summaryFeed.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">📰 전체 상담 요약</h2>
            <div className="space-y-4">
              {summaryFeed.map((item, index) => (
                <div key={index} className="p-4 border rounded bg-white shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">👤 {item.user_id} • {new Date(item.created_at).toLocaleString()}</p>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
