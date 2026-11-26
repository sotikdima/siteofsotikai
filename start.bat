@echo off
chcp 65001 >nul
title СайтСотика — локальный запуск (Twitch + чат)
echo ============================================================
echo   СайтСотика / ПорталСотика — локальный запуск проекта
echo   Twitch-плеер fsbsotik + ТвичатикСотика + ЧатикСотика
echo ============================================================
echo.

cd /d "%~dp0"

REM --- Проверка Node.js ---
where node >nul 2>nul
if errorlevel 1 (
    echo [ОШИБКА] Node.js не найден. Установите его с https://nodejs.org
    pause
    exit /b 1
)

REM --- Установка зависимостей при первом запуске ---
if not exist "node_modules" (
    echo Первый запуск: устанавливаю зависимости...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ОШИБКА] Не удалось установить зависимости.
        pause
        exit /b 1
    )
)

REM --- Запуск дев-сервера (localhost:3000) ---
echo Запускаю сервер. Откройте в браузере: http://localhost:3000
echo Чтобы остановить — закройте это окно или нажмите Ctrl+C
echo.
call npm run dev

pause