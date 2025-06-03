const express = require('express');
const cors = require('cors');
require('dotenv').config();

const OpenAI = require('openai');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// GPT 세팅
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
    // GPT 호출 
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system", // system 프롬프트로 성격 설정
          content: "너는 회사 고충을 듣는 친절하고 차분한 상담자야. 사용자의 말을 판단하지 않고 따뜻하게 반응해."
        },
        {
          role: "user",
          content: message
        }
      ],
    });
    
    const gptReply = completion.choices[0].message.content;

    // DB 저장
    const query = `
      INSERT INTO chat_logs (user_id, message, response)
      VALUES (?, ?, ?)
    `;
    await db.query(query, [userId, message, gptReply]);

    // 클라이언트에게 응답 전달
    res.json({ reply: gptReply });

  } catch (err) {
    console.error('❌ GPT 처리 실패:', err);
    res.status(500).json({ error: 'GPT 또는 DB 처리 중 오류' });
  }
});

// GET /api/history/:userId 라우트 추가 (이전 대화 불러오기)

app.get('/api/history/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(
      `SELECT id, message, response, timestamp
       FROM chat_logs
       WHERE user_id = ?
       ORDER BY timestamp DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ 대화 기록 조회 실패:', err);
    res.status(500).json({ error: '대화 기록을 불러오는 데 실패했습니다.' });
  }
});

// 기본 루트 확인용
app.get('/', (req, res) => {
  res.send('GPT 상담 백엔드 서버 작동 중입니다!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
