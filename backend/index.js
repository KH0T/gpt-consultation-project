const express = require('express');
const cors = require('cors');
require('dotenv').config();

const OpenAI = require('openai');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 📌 GPT key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 📌 POST /api/chat : 사용자 질문 → GPT → 응답 → DB 저장 → 응답 전송
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'userId 또는 message가 없습니다.' });
  }

  try {
    // 상담 종료 처리
    if (message.toLowerCase().includes('대화 종료')) {
      // 1. 사용자의 전체 대화 불러오기
      const [logs] = await db.query(
        `SELECT message, response FROM chat_logs WHERE user_id = ? ORDER BY timestamp`,
        [userId]
      );

      // 2. 메시지를 GPT 요약용 포맷으로 구성
      const chatHistory = logs.flatMap((log) => [
        { role: 'user', content: log.message },
        { role: 'assistant', content: log.response }
      ]);

      // 3. GPT에게 요약 요청
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: "system", content: "다음은 사용자와의 상담 내용이야. 전체적인 고민을 이해하고 요약해서 보고서 형식으로 정리해. 조언은 하지말고 결과만 담아" },
          ...chatHistory,
          { role: "user", content: "이 대화를 요약해줘." }
        ]
      });

      const summary = completion.choices[0].message.content;

      // 4. 요약 DB에 저장
      await db.query(
        `INSERT INTO summary_logs (user_id, summary) VALUES (?, ?)`,
        [userId, summary]
      );

      return res.json({ message: '대화가 종료되었습니다.' });
    }

    // 일반 메시지 처리
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: "너는 고충을 파악하기 위한 역할이야. 짧고 간결하게 대답하고 고충의 원인을 파악해보도록 노력해." },
        { role: "user", content: message }
      ]
    });

    const gptReply = completion.choices[0].message.content;

    // DB 저장
    await db.query(
      `INSERT INTO chat_logs (user_id, message, response) VALUES (?, ?, ?)`,
      [userId, message, gptReply]
    );

    res.json({ reply: gptReply });

  } catch (err) {
    console.error('❌ 오류 발생:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});


// 📌 GET /api/history/:userId 라우트 추가 (이전 대화 불러오기)

// 최신 상담 요약 불러오기
app.get('/api/summary', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT user_id, summary, created_at
       FROM summary_logs
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ 요약 전체 조회 실패:', err);
    res.status(500).json({ error: '서버 오류' });
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
