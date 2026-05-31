@echo off
chcp 65001 > nul
title SPEAKZEN Update
echo ===============================
echo  SPEAKZEN 업데이트 (Cloudflare 자동 재배포)
echo ===============================
echo.

cd /d "%~dp0"

echo [1/2] 원본 레포에서 최신 코드 받는 중...
git pull origin claude/initial-setup-dcvoF
if errorlevel 1 (
    echo.
    echo X 최신 코드 받기 실패. 위 메시지 확인 후 재시도.
    pause
    exit /b 1
)
echo.

echo [2/2] SPA 레포에 푸시 (main 브랜치)...
git push spa claude/initial-setup-dcvoF:main
if errorlevel 1 (
    echo.
    echo X 푸시 실패. 위 메시지 확인.
    pause
    exit /b 1
)

echo.
echo ===============================
echo  완료! Cloudflare가 자동으로 재배포합니다.
echo  3~5분 후 https://spafinal.pages.dev 새로고침
echo ===============================
echo.
pause
