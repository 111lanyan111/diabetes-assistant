@echo off
chcp 936 >nul
title 糖尿病预治智能助手 - 一键关闭

echo ========================================
echo    糖尿病预治智能助手 关闭中...
echo ========================================
echo.

REM 1. 关闭前端 HTTP 服务器（端口8081）
echo [1/3] 关闭前端 HTTP 服务（端口8081）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do (
    echo       [*] 正在关闭进程 PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo       [OK] 前端 HTTP 服务已关闭
echo.

REM 2. 关闭后端 Flask API 服务（端口5000）
echo [2/3] 关闭后端 API 服务（端口5000）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo       [*] 正在关闭进程 PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo       [OK] 后端 API 服务已关闭
echo.

REM 3. 关闭 Ollama 服务
echo [3/3] 关闭 Ollama AI 服务...
tasklist /fi "imagename eq ollama app.exe" 2>nul | find /i "ollama app.exe" >nul
if %errorlevel% equ 0 (
    echo       [*] 正在关闭 Ollama...
    taskkill /im "ollama app.exe" /F >nul 2>&1
    taskkill /im "ollama.exe" /F >nul 2>&1
    echo       [OK] Ollama 服务已关闭
) else (
    echo       [OK] Ollama 服务未运行
)
echo.

REM 关闭相关的 cmd 窗口
echo [*] 正在关闭服务窗口...
taskkill /fi "windowtitle eq HTTP服务器" /F >nul 2>&1
taskkill /fi "windowtitle eq 后端API服务" /F >nul 2>&1
echo       [OK] 服务窗口已关闭
echo.

echo ========================================
echo    所有服务已关闭！
echo.
echo    如有残留进程，请手动关闭：
echo    1. 任务管理器中结束 python.exe 进程
echo    2. 任务管理器中结束 ollama app.exe 进程
echo ========================================
echo.
pause