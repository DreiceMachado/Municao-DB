@echo off
chcp 65001 >nul
title BalísticaDB - Instalador
setlocal enableextensions enabledelayedexpansion

rem ── Eleva para administrador ────────────────────────────────────────────────
net session >nul 2>&1
if not %errorLevel% == 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"
cls

rem ── Localiza a pasta da automação (nome tem acento) ─────────────────────────
set "AUTODIR="
for /d %%D in ("Automa*REP") do set "AUTODIR=%%D"

echo.
echo  BalísticaDB - Instalador Completo
echo  =================================
echo.

rem ── [1/8] Node.js ───────────────────────────────────────────────────────────
echo [1/8] Verificando Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo   Node.js nao encontrado. Abrindo o site para download...
    start https://nodejs.org
    echo   Instale o Node.js e execute este instalador novamente.
    pause
    exit /b
)
echo   OK - Node.js encontrado
echo.

rem ── [2/8] Python ────────────────────────────────────────────────────────────
echo [2/8] Verificando Python...
set "PYCMD="
py --version >nul 2>&1 && set "PYCMD=py"
if not defined PYCMD ( python --version >nul 2>&1 && set "PYCMD=python" )
if not defined PYCMD (
    echo   Python nao encontrado. Abrindo o site para download...
    echo   IMPORTANTE: marque "Add Python to PATH" durante a instalacao.
    start https://www.python.org/downloads/
    echo   Instale o Python e execute este instalador novamente.
    pause
    exit /b
)
echo   OK - Python encontrado (!PYCMD!)
echo.

rem ── [3/8] Dependencias do app (Node) ────────────────────────────────────────
echo [3/8] Instalando dependencias do app...
call npm install
echo.

rem ── [4/8] Dependencias da automacao GDL (Python) ────────────────────────────
echo [4/8] Instalando dependencias da automacao GDL...
if defined AUTODIR (
    !PYCMD! -m pip install --upgrade pip
    !PYCMD! -m pip install -r "!AUTODIR!\requirements.txt"
) else (
    echo   [!] Pasta da automacao nao encontrada - pulando (importacao de REP nao vai funcionar).
)
echo.

rem ── [5/8] Navegador do Playwright (usa o Microsoft Edge do sistema) ──────────
echo [5/8] Preparando o navegador (Playwright + Edge)...
if defined AUTODIR (
    !PYCMD! -m playwright install msedge
) else (
    echo   [!] Pulado (pasta da automacao ausente).
)
echo.

rem ── [6/8] Conferindo os arquivos .env ───────────────────────────────────────
echo [6/8] Conferindo configuracao (.env)...
set "FALTA="
if not exist ".env" (
    echo   [!] Falta o .env da raiz. Criando a partir do exemplo...
    if exist ".env.example" copy /y ".env.example" ".env" >nul
    set "FALTA=1"
)
if defined AUTODIR if not exist "!AUTODIR!\.env" (
    echo   [!] Falta o .env da automacao. Criando a partir do exemplo...
    if exist "!AUTODIR!\.env.example" copy /y "!AUTODIR!\.env.example" "!AUTODIR!\.env" >nul
    set "FALTA=1"
)
if defined FALTA (
    echo.
    echo   ============================================================
    echo    ATENCAO: preencha os arquivos .env ANTES de usar o sistema:
    echo      - .env               ^(URL do ngrok + anon key^)
    echo      - !AUTODIR!\.env      ^(usuario e senha do GDL^)
    echo    Sem isso, a sincronizacao e a importacao NAO funcionam.
    echo   ============================================================
    echo.
    pause
) else (
    echo   OK - arquivos .env encontrados
)
echo.

rem ── [7/8] Servidor estatico (mantido do instalador original) ────────────────
echo [7/8] Instalando servidor...
call npm install -g serve
echo.

rem ── [8/8] Compilando o projeto ──────────────────────────────────────────────
echo [8/8] Compilando o projeto...
call npm run build
echo.

echo =================================
echo  Instalacao concluida!
echo  Execute start.bat para iniciar
echo  Acesse: http://localhost:3000
echo =================================
echo.
pause
