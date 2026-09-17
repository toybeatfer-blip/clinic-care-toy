@echo off
title CLINIC CARE TOY - Servidor Local
cd /d "%~dp0"
echo ========================================================
echo   CLINIC CARE TOY - Copiloto SAC y Redactor NOM-004
echo ========================================================
echo.
echo Abriendo navegador en http://localhost:3000 ...
start http://localhost:3000
echo Iniciando servidor...
node server.js
pause
