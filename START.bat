@echo off
chcp 65001 > nul
title SPEAKZEN Server
echo ===============================
echo  SPEAKZEN 서버 시작 중...
echo ===============================
echo.

cd /d "%~dp0"

echo [1/2] 최신 코드 받는 중...
git pull origin claude/initial-setup-dcvoF
echo.

echo [2/2] 서버 시작 (포트 3001)
echo.
echo 크롬에서 접속: http://localhost:3001
echo 동료 공유용:   http://[본인IP]:3001
echo.
echo 종료하려면 Ctrl+C 두 번 누르세요.
echo ===============================
echo.

npm run dev -- -p 3001 -H 0.0.0.0

pause
