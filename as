<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>종이컵 사용 줄이기 - 포스터</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Raleway:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}
body {
font-family: 'Noto Sans KR', sans-serif;
background: #f0f0f0;
padding: 20px;
}
.poster {
width: 100%;
max-width: 900px;
margin: 20px auto;
background: white;
box-shadow: 0 10px 40px rgba(0,0,0,0.15);
page-break-after: always;
position: relative;
overflow: hidden;
border-radius: 20px;
}
.poster-page-1 {
background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
color: white;
padding: 35px 35px;
min-height: 1300px;
display: flex;
flex-direction: column;
justify-content: space-between;
position: relative;
}
.poster-page-2 {
background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
color: white;
padding: 35px 35px;
min-height: 1300px;
position: relative;
}
/* 배경 패턴 - 큰 이미지 */
.bg-pattern {
position: absolute;
top: -50px;
right: -100px;
width: 500px;
height: 500px;
font-size: 300px;
opacity: 0.12;
pointer-events: none;
z-index: 1;
line-height: 1;
}
.bg-pattern-2 {
position: absolute;
bottom: -80px;
left: -120px;
width: 450px;
height: 450px;
font-size: 280px;
opacity: 0.1;
pointer-events: none;
z-index: 1;
line-height: 1;
}
/* 추가 배경 요소 */
.bg-accent {
position: absolute;
opacity: 0.09;
pointer-events: none;
z-index: 2;
line-height: 1;
}
.bg-accent-1 {
font-size: 280px;
top: 20%;
left: 8%;
}
.bg-accent-2 {
font-size: 250px;
top: 55%;
right: 5%;
}
.bg-accent-3 {
font-size: 260px;
top: 10%;
right: 10%;
}
.bg-accent-4 {
font-size: 240px;
bottom: 20%;
left: 5%;
}
.bg-accent-5 {
font-size: 270px;
top: 45%;
left: 3%;
}
.bg-accent-6 {
font-size: 280px;
bottom: 5%;
right: 8%;
}
.bg-accent-7 {
font-size: 260px;
top: 25%;
right: 3%;
}
.bg-accent-8 {
font-size: 250px;
bottom: 35%;
left: 12%;
}
.header-section {
text-align: center;
margin-bottom: 25px;
position: relative;
z-index: 5;
}
.main-icon {
font-size: 130px;
margin: 15px 0;
animation: float 3s ease-in-out infinite;
display: inline-block;
}
@keyframes float {
0%, 100% { transform: translateY(0px); }
50% { transform: translateY(-20px); }
}
.main-title {
font-family: 'Raleway', sans-serif;
font-size: 5.5em;
font-weight: 900;
margin: 10px 0;
text-shadow: 5px 5px 10px rgba(0,0,0,0.3);
line-height: 1.1;
letter-spacing: -2px;
}
.subtitle {
font-size: 2.2em;
font-weight: 700;
margin: 10px 0 25px 0;
text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
line-height: 1.3;
}
.divider {
height: 5px;
width: 250px;
background: rgba(255,255,255,0.6);
margin: 15px auto;
border-radius: 3px;
}
.key-stats {
display: grid;
grid-template-columns: 1fr 1fr 1fr;
gap: 18px;
margin: 30px 0;
position: relative;
z-index: 5;
}
.stat-card {
background: rgba(255,255,255,0.15);
padding: 28px 20px;
border-radius: 18px;
text-align: center;
backdrop-filter: blur(10px);
border: 2px solid rgba(255,255,255,0.2);
transition: transform 0.3s ease, box-shadow 0.3s ease;
cursor: pointer;
}
.stat-card:hover {
transform: translateY(-12px) scale(1.05);
box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.stat-icon {
font-size: 110px;
margin-bottom: 10px;
display: inline-block;
}
.stat-number {
font-family: 'Raleway', sans-serif;
font-size: 3.2em;
font-weight: 900;
margin: 8px 0;
text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
color: #ffffcc;
}
.stat-label {
font-size: 1.25em;
font-weight: 600;
line-height: 1.5;
}
.vs-section {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 25px;
margin: 30px 0;
align-items: center;
position: relative;
z-index: 5;
}
.vs-item {
text-align: center;
padding: 35px 30px;
border-radius: 18px;
transition: transform 0.3s ease;
cursor: pointer;
}
.vs-item:hover {
transform: scale(1.07);
}
.bad {
background: rgba(231, 76, 60, 0.3);
border: 3px solid rgba(231, 76, 60, 0.6);
}
.good {
background: rgba(52, 152, 219, 0.3);
border: 3px solid rgba(52, 152, 219, 0.6);
}
.vs-big-icon {
font-size: 110px;
margin: 15px 0;
display: inline-block;
}
.vs-title {
font-family: 'Raleway', sans-serif;
font-size: 2.6em;
font-weight: 800;
margin-bottom: 12px;
}
.vs-text {
font-size: 1.65em;
line-height: 1.7;
font-weight: 600;
}
.highlight-box {
background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%);
border: 3px solid rgba(255,255,255,0.3);
padding: 32px;
border-radius: 18px;
margin: 25px 0;
text-align: center;
backdrop-filter: blur(10px);
position: relative;
z-index: 5;
}
.highlight-title {
font-family: 'Raleway', sans-serif;
font-size: 2.8em;
font-weight: 900;
margin-bottom: 20px;
color: #ffffcc;
}
.benefits-grid {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 16px;
margin: 20px 0;
}
.benefit-item {
background: rgba(255,255,255,0.12);
padding: 22px;
border-radius: 13px;
border-left: 5px solid rgba(255,255,255,0.5);
text-align: center;
transition: transform 0.3s ease;
cursor: pointer;
}
.benefit-item:hover {
transform: translateY(-6px);
}
.benefit-icon {
font-size: 75px;
margin-bottom: 8px;
display: inline-block;
}
.benefit-number {
font-family: 'Raleway', sans-serif;
font-size: 3em;
font-weight: 900;
margin: 8px 0;
color: #ffffcc;
}
.benefit-text {
font-size: 1.15em;
font-weight: 600;
}
.tumbler-grid {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 20px;
margin: 30px 0;
position: relative;
z-index: 5;
}
.tumbler-card {
background: rgba(255,255,255,0.12);
padding: 32px 25px;
border-radius: 18px;
border: 2px solid rgba(255,255,255,0.25);
text-align: center;
backdrop-filter: blur(10px);
transition: transform 0.3s ease, box-shadow 0.3s ease;
cursor: pointer;
}
.tumbler-card:hover {
transform: translateY(-15px) scale(1.05);
box-shadow: 0 20px 40px rgba(0,0,0,0.2);
background: rgba(255,255,255,0.18);
}
.tumbler-icon {
font-size: 110px;
margin: 12px 0;
display: inline-block;
}
.tumbler-name {
font-family: 'Raleway', sans-serif;
font-size: 2em;
font-weight: 800;
margin: 12px 0;
color: #ffffcc;
}
.tumbler-desc {
font-size: 1.25em;
line-height: 1.9;
font-weight: 600;
}
.stars {
font-size: 1.5em;
margin-top: 10px;
letter-spacing: 2px;
display: inline-block;
}
.tips-section {
background: rgba(255,255,255,0.12);
padding: 32px;
border-radius: 18px;
margin: 25px 0;
border: 2px solid rgba(255,255,255,0.25);
position: relative;
z-index: 5;
}
.tips-title {
font-family: 'Raleway', sans-serif;
font-size: 2.6em;
font-weight: 900;
margin-bottom: 22px;
text-align: center;
color: #ffffcc;
}
.tips-grid {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 16px;
}
.tip-item {
background: rgba(255,255,255,0.08);
padding: 20px;
border-radius: 13px;
border-left: 4px solid rgba(255,255,255,0.4);
transition: transform 0.3s ease;
cursor: pointer;
}
.tip-item:hover {
transform: translateY(-6px);
}
.tip-icon {
font-size: 50px;
margin-bottom: 8px;
display: inline-block;
}
.tip-title {
font-family: 'Raleway', sans-serif;
font-size: 1.5em;
font-weight: 800;
margin: 10px 0;
color: #ffffcc;
}
.tip-text {
font-size: 1.15em;
line-height: 1.8;
font-weight: 600;
}
.cta-box {
background: rgba(255,255,255,0.15);
border: 3px solid rgba(255,255,255,0.4);
padding: 38px;
border-radius: 18px;
text-align: center;
margin: 28px 0;
backdrop-filter: blur(10px);
position: relative;
z-index: 5;
}
.cta-main {
font-family: 'Raleway', sans-serif;
font-size: 3.5em;
font-weight: 900;
margin-bottom: 15px;
text-shadow: 3px 3px 6px rgba(0,0,0,0.2);
color: #ffffcc;
}
.cta-sub {
font-size: 1.5em;
font-weight: 700;
margin-bottom: 20px;
line-height: 1.6;
}
.step-grid {
display: grid;
grid-template-columns: 1fr 1fr 1fr;
gap: 12px;
margin-top: 20px;
}
.step {
background: rgba(255,255,255,0.12);
padding: 24px 16px;
border-radius: 13px;
border: 2px solid rgba(255,255,255,0.3);
transition: transform 0.3s ease;
cursor: pointer;
}
.step:hover {
transform: translateY(-8px) scale(1.04);
}
.step-num {
font-family: 'Raleway', sans-serif;
font-size: 2.5em;
font-weight: 900;
margin-bottom: 8px;
color: #ffffcc;
}
.step-text {
font-size: 1.25em;
font-weight: 700;
line-height: 1.6;
}
.footer-text {
text-align: center;
font-size: 1.4em;
font-weight: 700;
margin-top: 30px;
padding-top: 20px;
border-top: 2px solid rgba(255,255,255,0.3);
position: relative;
z-index: 5;
color: white;
}
/* 색상 강조 */
.color-accent-1 {
color: #ffeb3b;
}
@media print {
body {
background: white;
padding: 0;
}
.poster {
max-width: 100%;
margin: 0;
box-shadow: none;
border-radius: 0;
}
}
</style>
</head>
<body>
<!-- PAGE 1 -->
<div class="poster">
<div class="poster-page-1">
<div class="bg-pattern">🌱</div>
<div class="bg-pattern-2">♻️</div>
<div class="bg-accent bg-accent-1">🌲</div>
<div class="bg-accent bg-accent-2">🍃</div>
<div class="bg-accent bg-accent-3">🌳</div>
<div class="bg-accent bg-accent-4">🌿</div>
<div class="header-section">
<div class="main-icon">🌍</div>
<h1 class="main-title">종이컵<br>사용 줄이기</h1>
<div class="divider"></div>
<p class="subtitle">개인 텀블러·머그컵으로<br>지구를 지켜요!</p>
</div>
<div class="key-stats">
<div class="stat-card">
<div class="stat-icon">🌳</div>
<div class="stat-number">500억</div>
<div class="stat-label">매년 사용되는<br>종이컵</div>
</div>
<div class="stat-card">
<div class="stat-icon">🌲</div>
<div class="stat-number">400만</div>
<div class="stat-label">벌채되는 나무<br>(톤/년)</div>
</div>
<div class="stat-card">
<div class="stat-icon">💧</div>
<div class="stat-number">140억</div>
<div class="stat-label">필요한 물의 양<br>(리터/년)</div>
</div>
</div>
<div class="vs-section">
<div class="vs-item bad">
<div class="vs-big-icon">🥛</div>
<div class="vs-title">일회용<br>종이컵</div>
<div class="vs-text">
❌ 매년 500억 개 폐기<br>
❌ 재활용율 10% 미만<br>
❌ 산림 파괴<br>
❌ 탄소 배출
</div>
</div>
<div class="vs-item good">
<div class="vs-big-icon">☕</div>
<div class="vs-title">개인<br>텀블러</div>
<div class="vs-text">
✅ 재사용 가능<br>
✅ 폐기물 감소<br>
✅ 지속가능<br>
✅ 탄소 중립
</div>
</div>
</div>
<div class="highlight-box">
<div class="highlight-title">💎 텀블러 1개의 가치</div>
<div class="benefits-grid">
<div class="benefit-item">
<div class="benefit-icon">📦</div>
<div class="benefit-number">250개</div>
<div class="benefit-text">종이컵 절감<br>(1년 기준)</div>
</div>
<div class="benefit-item">
<div class="benefit-icon">💨</div>
<div class="benefit-number">27.5kg</div>
<div class="benefit-text">CO₂ 감축<br>(연간)</div>
</div>
<div class="benefit-item">
<div class="benefit-icon">🌿</div>
<div class="benefit-number">10그루</div>
<div class="benefit-text">나무 보호<br>(1년)</div>
</div>
<div class="benefit-item">
<div class="benefit-icon">💰</div>
<div class="benefit-number">15,000원</div>
<div class="benefit-text">비용 절감<br>(연간)</div>
</div>
</div>
</div>
<div class="footer-text">
🌍 함께하는 작은 실천이 <span class="color-accent-1">지구의 미래</span>를 바꿉니다!
</div>
</div>
</div>
<!-- PAGE 2 -->
<div class="poster">
<div class="poster-page-2">
<div class="bg-pattern">🥤</div>
<div class="bg-pattern-2">🌱</div>
<div class="bg-accent bg-accent-1">💚</div>
<div class="bg-accent bg-accent-2">🌳</div>
<div class="bg-accent bg-accent-4">🌲</div>
<div class="bg-accent bg-accent-5">💧</div>
<div class="bg-accent bg-accent-6">🌿</div>
<div class="bg-accent bg-accent-7">🌾</div>
<div class="bg-accent bg-accent-8">🍃</div>
<div class="header-section" style="margin-bottom: 20px;">
<h1 class="main-title" style="font-size: 4.3em; margin: 8px 0;">텀블러<br>선택가이드</h1>
<div class="divider"></div>
</div>
<div class="tumbler-grid">
<div class="tumbler-card">
<div class="tumbler-icon">🥤</div>
<div class="tumbler-name">스테인리스<br>텀블러</div>
<div class="tumbler-desc">
✓ 가볍고 휴대성 좋음<br>
✓ 내구성 강함<br>
✓ 온도 유지 우수
</div>
<div class="stars">⭐⭐⭐⭐⭐</div>
</div>
<div class="tumbler-card">
<div class="tumbler-icon">☕</div>
<div class="tumbler-name">도자기<br>머그</div>
<div class="tumbler-desc">
✓ 책상 비치용 최고<br>
✓ 세련된 디자인<br>
✓ 음료 맛 좋음
</div>
<div class="stars">⭐⭐⭐⭐</div>
</div>
<div class="tumbler-card">
<div class="tumbler-icon">🧊</div>
<div class="tumbler-name">이중 구조<br>텀블러</div>
<div class="tumbler-desc">
✓ 최고의 보온성<br>
✓ 결로 방지<br>
✓ 편안한 사용감
</div>
<div class="stars">⭐⭐⭐⭐⭐</div>
</div>
<div class="tumbler-card">
<div class="tumbler-icon">♻️</div>
<div class="tumbler-name">친환경<br>소재</div>
<div class="tumbler-desc">
✓ 대나무·옥수수 소재<br>
✓ 환경친화적<br>
✓ 지속가능성 최고
</div>
<div class="stars">⭐⭐⭐⭐⭐</div>
</div>
</div>
<div class="tips-section">
<div class="tips-title">✨ 올바른 관리법</div>
<div class="tips-grid">
<div class="tip-item">
<div class="tip-icon">🧹</div>
<div class="tip-title">세척 방법</div>
<div class="tip-text">
✓ 찬물로 먼저 헹굼<br>
✓ 식기세제로 깨끗이<br>
✓ 완전히 건조<br>
✓ 뚜껑도 함께 세척
</div>
</div>
<div class="tip-item">
<div class="tip-icon">💧</div>
<div class="tip-title">사용 팁</div>
<div class="tip-text">
✓ 매일 세척하기<br>
✓ 사용 후 바로 헹굼<br>
✓ 주기적 살균<br>
✓ 물때 제거 (구연산)
</div>
</div>
<div class="tip-item">
<div class="tip-icon">🍵</div>
<div class="tip-title">더 나은 활용</div>
<div class="tip-text">
✓ 카페 방문 시 지참<br>
✓ 온도 유지로 맛 향상<br>
✓ 사무실에 보관<br>
✓ 친구와 함께 실천
</div>
</div>
<div class="tip-item">
<div class="tip-icon">👥</div>
<div class="tip-title">함께 실천하기</div>
<div class="tip-text">
✓ 팀원들과 함께 참여<br>
✓ 사무실 문화 개선<br>
✓ 월별 환경 목표 달성<br>
✓ 경험 공유하기
</div>
</div>
</div>
</div>
<div class="cta-box">
<div class="cta-main">🎯 우리의 실천 계획</div>
<div class="cta-sub">3가지 약속으로 시작하세요</div>
<div class="step-grid">
<div class="step">
<div class="step-num">1️⃣</div>
<div class="step-text">개인 텀블러<br>준비하기</div>
</div>
<div class="step">
<div class="step-num">2️⃣</div>
<div class="step-text">매일<br>가져오기</div>
</div>
<div class="step">
<div class="step-num">3️⃣</div>
<div class="step-text">깨끗이<br>사용하기</div>
</div>
</div>
</div>
<div style="text-align: center; margin-top: 25px; position: relative; z-index: 5;">
<p style="font-size: 1.6em; font-weight: 700; line-height: 1.6;">
☕ 매 사용마다 함께 만드는<br>
<span style="color: #ffeb3b; font-weight: 900; font-size: 1.9em;">지속가능한 미래</span>
</p>
</div>
<div class="footer-text">
🌱 문의: 비즈니스솔루션팀
</div>
</div>
</div>
</body>
</html>
