# SPEAKZEN — Cloudflare Pages 배포 가이드

회사 PC에서 Cloudflare Pages는 열리고 Vercel은 차단된 경우의 배포 방법.

---

## 0. 준비 (1회만)

- GitHub 계정 (이미 있음 — leejaeyong1357-pixel)
- Cloudflare 계정 — `https://dash.cloudflare.com/sign-up` 회원가입 (무료)
- HChat 개인 API Key (이미 발급받음)

---

## 1. Cloudflare Pages 프로젝트 생성

1. `https://dash.cloudflare.com` 로그인
2. 좌측 메뉴 **Workers & Pages** → **Create** 버튼 → **Pages** 탭 → **Connect to Git**
3. **GitHub 연결 승인** (Cloudflare가 본인 GitHub 리포 읽을 권한)
4. 리포 목록에서 **`AI-PPT-MAKER`** 선택 → **Begin setup**

---

## 2. 빌드 설정

| 항목 | 값 |
|---|---|
| Project name | `speakzen` (URL: `speakzen.pages.dev` 됨) |
| Production branch | `claude/initial-setup-dcvoF` |
| Framework preset | **Next.js** |
| Build command | `npm run pages:build` |
| Build output directory | `.vercel/output/static` |
| Root directory | (비워두기) |

---

## 3. 환경 변수 (Environment variables)

**Production** 탭에서 추가:

| Variable name | Value | 비고 |
|---|---|---|
| `NODE_VERSION` | `22` | (필수 — Cloudflare 기본은 구버전) |
| `GATE_USER` | (예: `teczen`) | Basic Auth 1차 잠금 사용자 |
| `GATE_PASS` | (강한 임의 문자열) | Basic Auth 1차 잠금 비번 |

⚠ `GATE_PASS`는 동료에게 알려줘야 1차 로그인 가능. 단톡방 금지, 1:1로만 공유.

비워두면 1차 잠금이 풀려서 URL만 알면 누구나 접속 가능.

---

## 4. 배포 시작

**Save and Deploy** 클릭 → 2~3분 빌드 → 성공 시 `https://speakzen.pages.dev` 또는 `https://speakzen-xxx.pages.dev` URL 발급.

이후 GitHub에 푸시하면 자동 재배포 됨.

---

## 5. Compatibility flags 설정 (필수)

배포 후:

1. **Settings** 탭 → **Functions** → **Compatibility flags**
2. **Production** 칸에 추가: `nodejs_compat`
3. **Preview** 칸도 동일하게 추가
4. **Save** → 재배포 자동 시작

이게 없으면 일부 Node API가 작동 안 함.

---

## 6. 사용

배포 완료 후 발급된 URL을 동료에게 1:1 공유.

```
URL: https://speakzen.pages.dev
ID: teczen
비번: [본인이 정한 GATE_PASS]
```

동료가 URL 접속 → 브라우저 1차 비번 팝업 → SPEAKZEN 진입 → 사번+이름 로그인 → 사용.

---

## 자주 묻는 질문

**Q. 본인 PC 꺼도 동작?**
A. ✅ Cloudflare가 24/7 서빙. 본인 PC와 무관.

**Q. 마이크 권한?**
A. ✅ Cloudflare는 정식 HTTPS라 빨간 경고 없이 마이크 권한 정상 작동.

**Q. 회사 방화벽?**
A. `*.pages.dev` 도메인을 회사가 막아두면 접속 불가. 본인 PC에서 한 번 열어 확인 필요.

**Q. 업데이트는?**
A. GitHub에 `git push` 하면 자동 재배포. 새 URL 발급 X (동일 URL 유지).

**Q. 비용?**
A. 무료. Cloudflare Pages는 월 500회 빌드 / 100K 요청까지 무료. SPEAKZEN 규모로는 평생 무료.

---

## 데이터 보안 메모

- `employees.json` (사번 + 이름 + 부서 + 직급) → Cloudflare 서버에 올라감
- 주민번호 등 민감 개인정보 → 없음 (이미 제거됨)
- 학습 기록·점수 → 사용자 브라우저에만 저장 (서버 X)
- HChat API Key → 사용자 브라우저에만 저장 (서버 X, 요청 시 프록시 통해 사내 HChat으로 전달)
