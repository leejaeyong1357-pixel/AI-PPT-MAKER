# Teczen SPA Trainer

현대자동차그룹 SPA(Speaking Proficiency Assessment) 영어시험을 AI와 함께 준비하는 웹앱.

## 기능 (개발 예정)

- 유형별 학습 (유형1~4, 각 100문제)
- 모의고사 50세트
- AI 피드백 (HChat 연동, 사용자별 API 키)
- TTS/STT 음성 학습 (Web Speech API)
- 오답노트, 학습 통계, 단어장
- 등급별 (Lv 1~8) 맞춤 난이도

## 기술 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (Teczen 브랜드 컬러)
- Recharts (유형3 차트 동적 렌더링)
- Web Speech API (TTS/STT)
- HChat API (AI 피드백)

## 실행

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

## 프로젝트 구조

```
├── app/                  # Next.js App Router 페이지
│   ├── page.tsx         # 홈
│   ├── chart-demo/      # 유형3 차트 렌더링 데모
│   └── layout.tsx
├── components/
│   └── charts/          # 차트 컴포넌트 (Recharts)
├── data/                # 문제 데이터 (JSON)
│   ├── type1_business_casual.json   (100문제)
│   ├── type2_opinion.json           (100문제)
│   ├── type3_visual.json            (100문제: 차트60 + 사진40)
│   ├── type4_summary.json           (100지문)
│   └── mock_exams.json              (모의고사 50세트)
├── lib/                 # 유틸리티 (색상 등)
└── scripts/             # 스크린샷 등 보조 스크립트
```

## SPA 등급 체계

| 등급 | 점수 | 등급 | 점수 |
|------|------|------|------|
| Lv 1 | 0-15 | Lv 5 | 50-64 |
| Lv 2 | 16-24 | Lv 6 | 65-74 |
| Lv 3 | 25-34 | Lv 7 | 75-84 |
| Lv 4 | 35-49 | Lv 8 | 85-96 |
