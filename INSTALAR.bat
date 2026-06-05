@echo off
title BalísticaDB - Instalador

net session >nul 2>&1
if not %errorLevel% == 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"
cls

echo.
echo  BalísticaDB - Instalador
echo  ========================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Node.js nao encontrado. Abrindo download...
    start https://nodejs.org
    echo Instale o Node.js e execute novamente.
    pause
    exit /b
)
echo OK - Node.js encontrado
echo.

echo [2/4] Instalando dependencias...
call npm install
echo.

echo [3/4] Compilando projeto...
call npm run build
echo.

echo [4/4] Instalando servidor...
call npm install -g serve
echo.

echo ========================
echo  Instalacao concluida!
echo  Execute start.bat para iniciar
echo  Acesse: http://localhost:3000
echo ========================
echo.
pause
