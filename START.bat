@echo off
chcp 65001 > nul
title SPEAKZEN Server (HTTPS)
echo ===============================
echo  SPEAKZEN 서버 시작 중 (HTTPS)
echo ===============================
echo.

cd /d "%~dp0"

echo [1/2] 최신 코드 받는 중...
git pull origin claude/initial-setup-dcvoF
echo.

echo [2/2] 서버 시작 (포트 3001 / HTTPS)
echo.
echo 본인 PC:   https://localhost:3001
echo 동료 공유: https://[본인IP]:3001
echo.
echo ※ 처음 접속 시 "안전하지 않음" 경고 나옴
echo    → 고급 → 안전하지 않은 페이지로 이동 (또는 무시하고 진행) 클릭
echo    → 그래야 마이크 권한이 정상 동작합니다 (HTTPS 필수)
echo.
echo 종료: Ctrl+C 두 번
echo ===============================
echo.

npm run dev -- --experimental-https -p 3001 -H 0.0.0.0

pause
