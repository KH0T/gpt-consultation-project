const express = require('express');
const cors = require('cors');
require('dotenv').config();

const OpenAI = require('openai');
const db = require('./db');

const { v4: uuidv4 } = require('uuid'); // /api/session/start  UUID 생성 라이브러리 추가


const app = express();
app.use(cors());
app.use(express.json());


// 📌 GPT key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 📌 POST /api/chat : 사용자 질문 → GPT → 응답 → DB 저장 → 응답 전송
  // 20250607 세션 ID 추가로 세션 별 대화 기억 추가
app.post('/api/chat', async (req, res) => {
  const { userId, sessionId, message } = req.body;

  if (!userId || !sessionId || !message) {
    return res.status(400).json({ error: 'userId, sessionId 또는 message가 없습니다.' });
  }

  try {
    // 대화 종료 처리
    if (message.toLowerCase().includes('대화 종료')) {
      const [logs] = await db.query(
        `SELECT message, response FROM chat_logs 
         WHERE user_id = ? AND session_id = ? 
         ORDER BY timestamp`,
        [userId, sessionId]
      );

      const chatHistory = logs.flatMap(log => [
        { role: 'user', content: log.message },
        { role: 'assistant', content: log.response }
      ]);

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: "system", content: "너는 고충을 듣고 보고서 형식으로 이를 공유하기 위한 역할이야. 단답형식으로 짧게 표현하도록 노록해." },
          ...chatHistory,
          { role: "user", content: "이 대화를 요약해줘." }
        ]
      });

      const summary = completion.choices[0].message.content;

      await db.query(
        `INSERT INTO summary_logs (user_id, summary) VALUES (?, ?)`,
        [userId, summary]
      );

      return res.json({ message: '대화가 종료되었습니다.' });
    }

    // 이전 대화 불러오기
    const [chatHistory] = await db.query(
      `SELECT message, response FROM chat_logs 
       WHERE user_id = ? AND session_id = ? 
       ORDER BY timestamp`,
      [userId, sessionId]
    );

    const messages = [
      { role: "system", content: "너는 고충을 파악하기 위한 역할이야. 짧고 간결하게 대답하고 고충의 원인을 파악해보도록 노력해." },
      ...chatHistory.flatMap(row => [
        { role: "user", content: row.message },
        { role: "assistant", content: row.response }
      ]),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages
    });

    const gptReply = completion.choices[0].message.content;

    await db.query(
      `INSERT INTO chat_logs (user_id, session_id, message, response) 
       VALUES (?, ?, ?, ?)`,
      [userId, sessionId, message, gptReply]
    );

    res.json({ reply: gptReply });
  } catch (err) {
    console.error('❌ 오류 발생:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});


// 세션 ID 발급 라우트
// 📌 POST /api/session/start 라우트 추가
app.post('/api/session/start', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId가 필요합니다.' });
  }

  const sessionId = uuidv4(); // 고유한 세션 ID 생성
  res.json({ sessionId });     // 클라이언트에 전달
});


// 📌 POST api/summary/:id/like 공감 처리 라우트
app.post('/api/summary/:id/like', async (req, res) => {
  const summaryId = req.params.id;

  try {
    await db.query(
      `UPDATE summary_logs SET likes = likes + 1 WHERE id = ?`,
      [summaryId]
    );
    res.json({ message: '공감이 추가되었습니다.' });
  } catch (err) {
    console.error('❌ 공감 처리 실패:', err);
    res.status(500).json({ error: '공감 처리 실패' });
  }
});

// 📌 GET api/summary/:id/like 공감 처리 라우트 (프론트 첫 화면 용)

app.get('/api/summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, user_id, summary, created_at, likes
      FROM summary_logs
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ 요약 불러오기 실패:', err);
    res.status(500).json({ error: '요약을 불러오는 데 실패했습니다.' });
  }
});

// 특정 사용자 요약
app.get('/api/summary/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(
      `SELECT summary, created_at
       FROM summary_logs
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '요약이 없습니다.' });
    }

    res.json({
      summary: rows[0].summary,
      createdAt: rows[0].created_at
    });
  } catch (err) {
    console.error('❌ 요약 조회 실패:', err);
    res.status(500).json({ error: '요약을 불러오는 데 실패했습니다.' });
  }
});



// 📌 기본 루트 확인용
app.get('/', (req, res) => {
  res.send('GPT 상담 백엔드 서버 작동 중입니다!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
