// 1. .env에 있는 DB 정보 불러오기
require('dotenv').config();
console.log("👉 환경변수 체크:", process.env.MYSQL_USER);

// 2. 필요한 라이브러리 불러오기
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); // ✅ MySQL 연결용

// 3. Express 앱 설정
const app = express();
app.use(cors());
app.use(express.json());

// 4. MySQL 연결 설정
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,     // .env에서 DB 호스트 읽기
  user: process.env.MYSQL_USER,     // 사용자 이름
  password: process.env.MYSQL_PASS, // 비밀번호
  database: process.env.MYSQL_DB    // 데이터베이스 이름
});

// 5. 실제로 연결 시도 + 로그 출력
connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL 연결 실패:', err);
  } else {
    console.log('✅ MySQL에 성공적으로 연결되었습니다.');
  }
});

// 6. 간단한 API 엔드포인트
app.get('/', (req, res) => {
  res.send('GPT 상담 백엔드 서버가 작동 중입니다!');
});

// 7. 서버 시작
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});


// 8. GPT test

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testGPT() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'GPT야, 테스트 응답 해줘!' }],
    });

    console.log('✅ GPT 응답:', response.choices[0].message.content);
  } catch (err) {
    console.error('❌ GPT 호출 실패:', err);
  }
}

testGPT();
