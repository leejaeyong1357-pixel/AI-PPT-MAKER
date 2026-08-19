# SPEAKZEN 인수인계 문서

테크젠 임직원 SPA(Speaking Proficiency Assessment) 영어 말하기 학습 웹앱.
이 문서 하나로 **새 담당자가 처음부터 끝까지 직접 운영**할 수 있도록 정리했습니다.

---

## 0. 지금 상태 (먼저 읽어주세요)

| 항목 | 상태 |
|---|---|
| 서비스 | **중단 중** — 모든 접속이 503 점검 페이지로 응답 |
| 중단 스위치 | `middleware.ts` 의 `MAINTENANCE_DEFAULT = true` |
| 배포 주소 | `https://spafinal.pages.dev` |
| 승인 상태 | **사내 정식 승인 전 파일럿** (아래 6번 항목 반드시 확인) |

재개 방법은 **5-3. 서비스 재개** 참고.

---

## 1. 이 앱이 하는 일

- 사번·이름으로 등록/로그인 → 시험일·목표등급·API 키 설정 → 학습
- **유형 1~4 학습**: 질문 듣기(TTS) → 음성 답변(STT) → AI 채점 → 상세 리포트
- **모의고사**: 4유형 연속 응시 → 종합 결과지
- **불꽃(연속 학습일)**: 매일 학습하면 레벨 상승, 하루 빠지면 하락. 전체 랭킹 제공
- **시험 일정**: 로그인하면 본인 시험 날짜·시간·장소만 표시
- **관리자**: 부서별 참여율 통계, 학습자 비밀번호 초기화, PDF 가이드 업로드

> 개인 점수·답변은 **본인 기기(localStorage)** 에만 저장되며 관리자 화면에 노출되지 않습니다.
> 학습자에게 공지로 약속한 내용이므로 **이 원칙은 반드시 유지**해야 합니다.

---

## 2. 기술 구조

```
학습자 브라우저
      │ HTTPS
      ▼
Cloudflare Pages (spafinal.pages.dev)   ← Next.js 14 (App Router, Edge Runtime)
      │
      ├─ Cloudflare KV (SPA_KV)          ← 설정·비번해시·불꽃·통계·업로드 파일
      │
      └─ /api/hchat → Cloudflare Tunnel → 사내 PC → 사내 HChat 게이트웨이 (AI 채점)
```

**핵심 기술 스택**

| 항목 | 내용 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) + TypeScript |
| 스타일 | Tailwind CSS |
| 차트 | Recharts + 직접 구현한 SVG |
| 배포 | Cloudflare Pages + `@cloudflare/next-on-pages` |
| 저장소 | Cloudflare KV (서버) + localStorage (기기) |
| 음성 | Web Speech API (브라우저 내장 TTS/STT) |
| AI | 사내 HChat 게이트웨이 (Claude 계열) |

**주요 폴더**

```
app/            페이지 + API 라우트 (전부 Edge Runtime)
  api/          서버 API (아래 3번 참고)
components/     UI 컴포넌트
lib/            핵심 로직 (hchat, storage, speech, scoring, sync)
data/           문제은행·직원명부·시험일정 JSON
middleware.ts   접속 게이트 + 점검 모드
```

**꼭 알아야 할 파일**

| 파일 | 역할 |
|---|---|
| `middleware.ts` | 점검 모드 스위치, Basic Auth 게이트 |
| `lib/hchat.ts` | AI 채점 프롬프트 + 응답 파싱 + 폴백 |
| `lib/speech.ts` | 음성 인식/합성 (모바일 중복 인식 대응 로직 포함) |
| `lib/storage.ts` | localStorage 저장 (사번별로 키 분리) |
| `lib/userSync.ts` | 기기 간 설정 동기화 (병합 규칙 주의) |
| `app/login/page.tsx` | 로그인 + 관리자 계정 해시 |
| `data/employees.json` | 직원 명부 (서버 전용, 클라이언트로 안 나감) |
| `data/exam_schedules.json` | 시험 일정 73명 |

---

## 3. API 목록

전부 `app/api/` 아래 Edge Runtime 라우트입니다.

| 경로 | 역할 |
|---|---|
| `/api/auth/login` | 사번·이름 검증 (본인 정보만 반환) |
| `/api/hchat` | AI 채점 프록시 → 터널 경유 사내 HChat |
| `/api/user-settings` | 본인 설정·비번해시 저장/조회/초기화 (KV) |
| `/api/flame` | 불꽃 랭킹 저장/조회 (KV) |
| `/api/exam-schedule` | **본인** 시험 일정만 조회 |
| `/api/admin/learners` | 관리자용 학습자 목록 (통계만) |
| `/api/admin/user-password` | 관리자용 비밀번호 변경/초기화 |
| `/api/assets` | PDF 가이드 업로드/다운로드 (KV) |

---

## 4. 인계받을 때 필요한 것 (코드 외 자산)

**아래는 저장소에 없습니다. 별도로 반드시 넘겨받으세요.**

- [ ] **GitHub 저장소 권한** — `leejaeyong1357-pixel/AI-PPT-MAKER` (개발), `leejaeyong1357-pixel/SPA` (배포용)
- [ ] **Cloudflare 계정 접근** — Pages 프로젝트 `spafinal`
- [ ] **관리자 계정 평문** — 코드에는 SHA-256 해시만 있어 복원 불가. 구두로 전달받아야 함
- [ ] **Cloudflare 환경변수 값** — 아래 표 참고
- [ ] **24시간 상시 PC** — 터널 구동용 (5번 참고)
- [ ] **HChat API 키 발급 경로** — 사용자마다 개인 키를 직접 발급받아 입력하는 구조

**Cloudflare 환경변수** (Pages → spafinal → Settings → Variables and Secrets)

| 이름 | 용도 | 비고 |
|---|---|---|
| `GATE_USER` | 사이트 진입 Basic Auth 아이디 | 없으면 게이트 비활성 |
| `GATE_PASS` | 사이트 진입 Basic Auth 비밀번호 | |
| `HCHAT_TUNNEL_URL` | 터널 주소 | **터널 재시작마다 변경됨** |
| `MAINTENANCE` | `0`=서비스 재개 / `1`=중단 | 미설정 시 코드 기본값 사용 |

**Cloudflare KV 바인딩** (Settings → Bindings)

| 변수명 | 값 |
|---|---|
| `SPA_KV` | KV 네임스페이스 (예: `spa-flame`) |

> `SPA_KV` 가 연결되지 않으면 설정 동기화·불꽃 랭킹·PDF 업로드가 조용히 동작하지 않습니다.
> (앱은 죽지 않고 해당 기능만 비활성화됩니다.)

---

## 5. 운영 방법

### 5-1. 코드 수정 후 배포

```bat
UPDATE.bat 더블클릭
```

내부 동작: `AI-PPT-MAKER` 에서 최신 코드 pull → `SPA` 저장소 main 으로 push → Cloudflare 자동 재배포 (3~5분)

**처음 세팅하는 PC 라면** 먼저 배포용 원격 저장소를 등록해야 합니다.

```bat
git clone https://github.com/leejaeyong1357-pixel/AI-PPT-MAKER.git
cd AI-PPT-MAKER
git checkout claude/initial-setup-dcvoF
git remote add spa https://github.com/leejaeyong1357-pixel/SPA.git
```

> push 가 거부되면(`rejected`) `git push spa claude/initial-setup-dcvoF:main --force` 를 사용합니다.
> `SPA` 는 배포 전용 거울이라 강제 푸시해도 안전합니다.

### 5-2. 터널 구동 (AI 채점에 필수)

사내 HChat 은 외부에서 직접 접근할 수 없어, 사내 PC 를 경유하는 터널이 필요합니다.

1. [cloudflared 다운로드](https://github.com/cloudflare/cloudflared/releases/latest) → `cloudflared-windows-amd64.exe`
2. `C:\cloudflared\` 폴더 생성 후 `cloudflared.exe` 로 이름 변경해 저장
3. 같은 폴더에 `START_TUNNEL.bat` 생성:

```bat
@echo off
chcp 65001 > nul
title HChat Tunnel - 끄지 마세요!
cd /d "%~dp0"
cloudflared.exe tunnel --url https://internal-apigw-kr.hmg-corp.io --http-host-header internal-apigw-kr.hmg-corp.io --origin-server-name internal-apigw-kr.hmg-corp.io --no-tls-verify
```

4. 더블클릭 → 검은 창에 뜨는 `https://xxx.trycloudflare.com` 주소 복사
5. Cloudflare 환경변수 `HCHAT_TUNNEL_URL` 에 붙여넣기 → Save
6. Deployments → **Retry deployment**

> ⚠️ **검은 창을 닫으면 AI 채점이 즉시 멈춥니다.** 해당 PC 는 계속 켜두어야 합니다.
> ⚠️ 터널을 재시작하면 **주소가 매번 바뀝니다.** 4~6번을 다시 해야 합니다.
> `Error 1016` 이 뜨면 대부분 터널 주소가 바뀐 것이 원인입니다.

### 5-3. 서비스 재개 / 중단

**빠른 전환** (재배포 불필요)
Cloudflare → spafinal → Settings → Variables → `MAINTENANCE` 값을
`0`(재개) 또는 `1`(중단) 로 설정 → Retry deployment

**코드로 전환**
`middleware.ts` 의 `MAINTENANCE_DEFAULT` 를 `false`(재개) / `true`(중단) 로 변경 후 `UPDATE.bat`

### 5-4. 학습자 비밀번호 분실 대응

비밀번호는 SHA-256 해시로만 저장되어 **원문 조회가 불가능**합니다.

관리자 로그인 → 학습자 표 → 해당 인원의 **비밀번호** 열에서
- **변경**: 임시 비밀번호 지정 후 본인에게 전달 (로그인 후 마이페이지에서 변경 안내)
- **초기화**: 비밀번호 삭제 → 본인이 "등록하기"로 재등록 (학습 기록은 유지)

### 5-5. 로컬 개발

```bash
npm install --legacy-peer-deps
npm run dev          # http://localhost:3000
npm run build        # 배포 전 검증 (반드시 통과 확인)
npx tsc --noEmit     # 타입 검사
```

> `--legacy-peer-deps` 없이 설치하면 의존성 충돌로 실패합니다.

---

## 6. 반드시 알아야 할 주의사항

### 6-1. 승인 상태 — 가장 중요

이 시스템은 **사내 정식 승인을 받지 않은 파일럿**입니다. 특히 **사내 HChat API 를 Cloudflare 터널로 외부 클라우드에 연결**하는 구조는 보안 검토 대상입니다.

**인원을 확대하거나 정식 운영하기 전에 반드시 보안/ICT 부서 검토를 받으세요.** 검토 시 다음 사실이 방어 논리가 됩니다.

- 개인정보(주민번호 등) 미수집 — 사번·이름·부서만 사용
- 학습 답변·점수는 본인 기기에만 저장, 서버에는 부서별 집계만 존재
- 개인별 API 키 사용 (공용 마스터 키 없음)
- 진입 Basic Auth + 사번·이름·비밀번호 이중 인증
- 소스 공개로 검증 가능

정식 운영으로 갈 경우 권장 방향: **사내 인프라 이관** > Named Tunnel + 접근통제 > 현행 유지.

### 6-2. 기술적 함정

| 항목 | 주의 |
|---|---|
| **터널 주소** | 재시작 시 매번 변경. 환경변수 갱신 필수 |
| **설정 동기화** | `lib/userSync.ts` 의 `mergeSettings` 는 필드별 병합. 단순 스프레드로 바꾸면 **API 키가 덮어써짐** (실제 발생했던 버그) |
| **음성 인식** | `lib/speech.ts` 는 엔진 인스턴스를 항상 1개만 유지. 이 로직을 건드리면 모바일에서 같은 단어가 여러 번 입력됨 |
| **사내망 마이크** | 브라우저 음성 인식은 외부 음성 서버를 사용. 사내망에서 차단되면 `network` 오류 → 직접 입력으로 안내 |
| **Edge Runtime** | 모든 API 에 `export const runtime = "edge"` 필수. Node 전용 API 사용 불가 |
| **직원 명부** | `data/employees.json` 은 서버에서만 import. 클라이언트 컴포넌트에서 import 하면 **전체 명부가 유출**됨 |
| **KV 미설정** | 조용히 기능만 비활성화되고 에러는 안 남. 동기화가 안 되면 `SPA_KV` 바인딩부터 확인 |

### 6-3. 개인정보 원칙 (학습자와의 약속)

가입 시 공지로 아래를 약속했습니다. **변경하려면 재동의가 필요합니다.**

- 관리자는 개인 학습 데이터·점수·답변을 볼 수 없음
- 관리자가 보는 것은 부서별 사용량·참여율뿐
- 답변은 사내 게이트웨이로만 전송

---

## 7. 자주 겪는 문제

| 증상 | 원인 / 해결 |
|---|---|
| 503 점검 화면만 나옴 | 의도된 중단 상태. 5-3 참고 |
| `Error 1016` | 터널 주소 변경. 5-2 의 4~6번 재수행 |
| AI 채점/번역이 `Unauthorized access` | API 키 불일치. 마이페이지에서 키 재입력 후 저장 |
| 모바일에서 같은 단어 반복 입력 | `lib/speech.ts` 수정 여부 확인 (엔진 중복 실행) |
| 마이크 `network` 오류 | 사내망 차단. 텍스트 직접 입력으로 안내 |
| 불꽃/설정이 기기 간 연동 안 됨 | `SPA_KV` 바인딩 확인 |
| 배포 후 화면이 그대로 | 브라우저 강제 새로고침 `Ctrl + Shift + R` |
| `npm install` 실패 | `--legacy-peer-deps` 옵션 사용 |

---

## 8. 인계 체크리스트

- [ ] GitHub 두 저장소 권한 이전 (`AI-PPT-MAKER`, `SPA`)
- [ ] Cloudflare 계정/프로젝트 접근 권한 이전
- [ ] 관리자 ID·비밀번호 구두 전달 (해시라 복원 불가)
- [ ] 환경변수 4종 값 전달 (`GATE_USER`, `GATE_PASS`, `HCHAT_TUNNEL_URL`, `MAINTENANCE`)
- [ ] `SPA_KV` 바인딩 확인
- [ ] 터널 구동 PC 인수 또는 새 PC 세팅
- [ ] 새 담당자 PC 에서 `UPDATE.bat` 1회 시연
- [ ] 보안/ICT 검토 진행 상황 공유
- [ ] 학습자 공지 문구(개인정보 약속) 내용 공유

---

*문서 작성 시점의 코드 기준입니다. 구조를 변경하면 이 문서도 함께 갱신해주세요.*
