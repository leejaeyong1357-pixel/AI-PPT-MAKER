# SPEAKZEN 배포 가이드

## 배포 옵션 비교

| 방식 | 장점 | 단점 | 추천 |
|---|---|---|---|
| **Vercel (외부)** | 5분 컷, 무료, 자동 도메인 | 외부 클라우드 (사내 데이터 정책 확인 필요) | 데모/테스트 |
| **사내 Linux 서버** | 사내망 보안, 내부 도메인 | IT팀 협조 필요 | **운영 권장** |
| **본인 PC IP 공유** | 즉시 가능 | PC 켜놔야 동작, IP 노출 | 임시 테스트만 |

---

## A. Vercel 배포 (가장 빠름, 5분)

### 사전 준비
- GitHub 계정 + 이 레포지토리에 푸시 권한 (이미 있음)

### 단계
1. https://vercel.com 접속 → **Sign Up with GitHub** 클릭
2. GitHub 권한 승인
3. **Add New Project** → `AI-PPT-MAKER` 레포 선택
4. **Branch**: `claude/initial-setup-dcvoF`
5. **Framework Preset**: Next.js (자동 감지)
6. **Build/Output**: 기본값 그대로
7. **Deploy** 클릭

→ 1~2분 후 `https://ai-ppt-maker-xxx.vercel.app` 같은 URL 발급. 끝.

### 도메인 변경 (선택)
- Settings → Domains → `speakzen.vercel.app` 같은 무료 서브도메인으로 변경 가능

### 자동 재배포
- `claude/initial-setup-dcvoF` 브랜치에 푸시할 때마다 자동 재배포

### ⚠ 주의
- Vercel은 외부 클라우드(미국). 학습자 명단(사번/주민번호 앞자리 등)이 외부로 나가는 셈
- 실제 운영 전 IT/보안팀 검토 필요
- 데이터는 사용자 브라우저에만 저장되므로 서버에는 학습 기록이 안 올라감 (그래도 정적 데이터 파일은 Vercel에 있음)

---

## B. 사내 Linux 서버 배포 (운영 권장)

### 사전 준비
- 사내 Linux 서버 (Ubuntu/RHEL) + SSH 접근 권한
- Node.js 18+ 설치 권한
- 사내 도메인 또는 사내망 IP 할당
- 80/443 또는 임의 포트 개방

### 단계

서버 SSH 접속 후:

```bash
# 1. 코드 받기
git clone https://github.com/leejaeyong1357-pixel/AI-PPT-MAKER.git
cd AI-PPT-MAKER
git checkout claude/initial-setup-dcvoF

# 2. Node.js 설치 (없으면)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 패키지 설치 + 빌드
npm install
npm run build

# 4. PM2로 상시 실행 (재부팅 자동 복구)
sudo npm install -g pm2
pm2 start npm --name speakzen -- start -- -p 3000
pm2 save
pm2 startup
```

### Nginx 리버스 프록시 (선택, 도메인+HTTPS)

```nginx
# /etc/nginx/sites-available/speakzen
server {
    listen 80;
    server_name speakzen.tecz.local;  # 사내 도메인

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

활성화:
```bash
sudo ln -s /etc/nginx/sites-available/speakzen /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

→ 사내망에서 `http://speakzen.tecz.local` 접속

### HTTPS (필수, 사내 인증서)
- 사내 PKI팀에 인증서 발급 요청
- Nginx config에 SSL 추가

### 업데이트 절차

```bash
cd ~/AI-PPT-MAKER
git pull origin claude/initial-setup-dcvoF
npm install
npm run build
pm2 restart speakzen
```

---

## C. 사내 PC IP로 임시 공유 (테스트만)

본인 PC에서:

```cmd
ipconfig
```

→ "IPv4 주소" 확인 (예: `10.123.45.67`)

PC에서 서버 실행:
```cmd
npm run dev -- -p 3001 -H 0.0.0.0
```

같은 사내망 직원에게 공유: `http://10.123.45.67:3001`

⚠ 단점:
- 본인 PC가 꺼지거나 잠자면 접속 안 됨
- 방화벽이 막을 수 있음
- 실제 운영 부적합

---

## 배포 전 체크리스트

- [ ] `data/employees.json`이 최신 명단인지 확인
- [ ] 관리자 비밀번호 (`82211489` / `Dlwodyd1357!@`) 변경 검토
  - 현재 `app/login/page.tsx` 상수에 하드코딩. 환경변수로 빼는 게 안전
- [ ] HChat API Key는 사용자가 직접 입력 (서버에 저장 안 됨, OK)
- [ ] `data/학습자명단.xlsx` 원본 파일 처리 검토 (커밋되어 있음, 민감하면 .gitignore 추가)
- [ ] 환경별 도메인 결정 (예: `speakzen-dev.tecz.local` / `speakzen.tecz.local`)
