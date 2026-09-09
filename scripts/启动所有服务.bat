@echo off
chcp 936 >nul
title 糖尿病预治智能助手 - 一键启动

echo ========================================
echo    糖尿病预治智能助手 启动中...
echo ========================================
echo.

REM 获取脚本所在目录的上级目录（项目根目录）
set PROJECT_DIR=%~dp0..
cd /d "%PROJECT_DIR%"

REM 1. 启动 Ollama AI 服务
echo [1/3] 检查 Ollama 服务...
tasklist /fi "imagename eq ollama app.exe" 2>nul | find /i "ollama app.exe" >nul
if %errorlevel% equ 0 (
    echo       [OK] Ollama 已在运行
) else (
    echo       [*] 正在启动 Ollama...
    start "" "ollama app.exe" 2>nul
    if errorlevel 1 (
        echo       [!] 未找到 ollama app.exe，请确保已安装 Ollama
        echo       [!] 下载地址: https://ollama.com/
    )
    timeout /t 5 /nobreak >nul
    echo       [OK] Ollama 启动完成
)
echo.

REM 2. 启动后端 Flask API 服务（端口5000）
echo [2/3] 启动后端 API 服务（端口5000）...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo       [OK] 后端 API 已在运行
) else (
    echo       [*] 正在启动后端 Flask API 服务...
    cd /d "%PROJECT_DIR%\backend"
    start "后端API服务" cmd /k "python app.py"
    timeout /t 4 /nobreak >nul
    echo       [OK] 后端 API 启动完成
)
echo.

REM 3. 启动前端 HTTP 服务器（端口8081）
echo [3/3] 启动前端 HTTP 服务（端口8081）...
netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo       [OK] 前端 HTTP 已在运行
) else (
    echo       [*] 正在启动前端 HTTP 服务器...
    cd /d "%PROJECT_DIR%"
    start "HTTP服务器" cmd /k "python -m http.server 8081"
    timeout /t 2 /nobreak >nul
    echo       [OK] 前端 HTTP 启动完成
)
echo.

echo [OK] 所有服务启动完成！
echo.
echo [*] 正在打开浏览器...
start "" "http://localhost:8081/index.html"
timeout /t 1 /nobreak >nul

echo.
echo ========================================
echo    启动完成！
echo.
echo    前端地址: http://localhost:8081/index.html
echo    后端API:  http://localhost:5000
echo    管理后台: http://localhost:8081/admin.html
echo.
echo    默认管理员: admin / admin123
echo    测试用户:   testuser / 123456
echo.
echo    注意事项:
echo    1. 请勿关闭弹出的服务窗口
echo    2. Ollama 需保持运行，AI功能才可用
echo    3. 首次 AI 回复可能需要 30-60 秒
echo    4. 关闭服务请运行 关闭所有服务.bat
echo ========================================
echo.
pause