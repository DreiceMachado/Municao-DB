@echo off
title BalísticaDB
cd /d "%~dp0"
node --env-file=.env server.js
pause
