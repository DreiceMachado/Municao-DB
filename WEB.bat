@echo off
chcp 65001 >nul
title BalísticaDB - Acesso pela Internet
cd /d "%~dp0"
echo.
echo  Preparando o BalisticaDB para acesso pela internet...
echo  (liga o Docker + Supabase, compila o app e abre o tunel)
echo.
call npm run web
pause
