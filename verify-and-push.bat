@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo  YiiArt: install, build check, then push
echo ============================================
call npm install --no-audit --no-fund
if errorlevel 1 goto fail
call npm run build
if errorlevel 1 goto fail
echo.
echo Build OK. Committing and pushing...
git add -A
git commit -m "Trust overhaul: quantified shipping/return policies, payment badges, custom request upload, review empty states"
git push origin main
if errorlevel 1 goto fail
echo.
echo Done! Vercel will redeploy automatically.
pause
exit /b 0
:fail
echo.
echo Something failed - do NOT push. Send the error above to Claude.
pause
exit /b 1
