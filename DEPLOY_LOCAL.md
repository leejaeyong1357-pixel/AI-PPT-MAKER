# SPEAKZEN 빠른 사내 공유 (PC 호스트)

> 본인 PC에서 서버를 띄우고 같은 사내 네트워크 동료에게 링크로 공유하는 가장 빠른 방법.

## 사전 체크
- Windows 명령 프롬프트 사용
- PC가 사내 네트워크에 연결됨
- 회사 방화벽이 외부에서 본인 PC로의 접속을 막지 않음

## 1단계 — 외부 접속 허용 모드로 서버 실행

`localhost` 대신 `0.0.0.0`으로 띄워야 같은 네트워크 사용자도 접속 가능.

```cmd
cd C:\Users\TECZ\AI-PPT-MAKER
npm run dev -- -p 3001 -H 0.0.0.0
```

서버 메시지 확인:
```
- Local:    http://localhost:3001
- Network:  http://10.123.45.67:3001   ← 이 주소가 다른 직원이 접속할 URL
```

## 2단계 — 본인 PC IP 확인

위 메시지에 "Network" URL이 안 보이면 따로 확인:

```cmd
ipconfig
```

→ "IPv4 주소" 옆 숫자 (예: `10.123.45.67`)

## 3단계 — Windows 방화벽 허용 (한 번만)

관리자 권한 cmd로:
```cmd
netsh advfirewall firewall add rule name="SPEAKZEN" dir=in action=allow protocol=TCP localport=3001
```

(에러 나면 IT팀에 "포트 3001 인바운드 허용" 요청)

## 4단계 — 동료에게 링크 공유

카톡/메일로 전송: `http://10.123.45.67:3001`

(본인 IP로 교체. 같은 사내 와이파이/VPN에 있어야 접속됨)

## ⚠ 한계

| 항목 | 상태 |
|---|---|
| 본인 PC가 꺼지면 | 모든 사용자 접속 불가 |
| 본인 PC가 잠자기 | 접속 끊김 |
| 본인 PC를 재부팅 | cmd 다시 실행 필요 |
| 다른 네트워크 (집·외근) | 접속 불가 |
| 동시 사용자 많을 때 | 본인 PC 부하 |

→ 5명 이내 데모/베타용으로만 OK. 본격 운영은 `DEPLOY.md`의 사내 서버 방식.

## 종료

cmd 창에서 **Ctrl+C** 두 번 → 서버 종료

## 다시 시작

cmd:
```cmd
cd C:\Users\TECZ\AI-PPT-MAKER
npm run dev -- -p 3001 -H 0.0.0.0
```
