@echo off
chcp 65001 >nul
title BalísticaDB - Túnel ngrok
cd /d "%~dp0"
echo.
echo  Abrindo o túnel ngrok (Supabase para a internet)...
echo.
node --env-file=.env tunel.js
pause
