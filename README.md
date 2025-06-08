# gpt-consultation-project

# 🧠 GPT 대화 공유 시스템

여러 사용자의 GPT와의 대화한 내용이 요약되어 첫 페이지에 게시물 형식으로 출력, 공감이 가능한 형식으로 게시되도록 함

## ✅ 주요 기능

- 사용자 닉네임 기반 세션 시작
- Vue 기반 자연스러운 대화 UI
- GPT-3.5를 통한 실시간 대화
- "대화 종료" 시 전체 대화 요약 후 DB 저장
- 모든 요약은 피드 형태로 메인 화면에 표시
- 각 요약에 ❤️ 공감 버튼 제공

## 🛠 기술 스택

- **프론트엔드**: React + Vue (Vite 기반 통합)
- **백엔드**: Node.js + Express
- **DB**: MySQL (AWS RDS)
- **AI**: OpenAI GPT-3.5 API

## 📁 프로젝트 구조

gpt-consultation-project/
├── backend/
│ ├── index.js # Express 서버
│ ├── db.js # MySQL 연결
│ └── .env # 환경 변수
├── frontend/
│ ├── App.jsx # 메인 React 컴포넌트
│ ├── components/
│ │ └── VueChat.vue # Vue 대화 UI
│ └── vue/
│ └── mountVue.js # Vue 마운트 스크립트
