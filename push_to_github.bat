@echo off
echo Initializing Git repository and pushing updates to https://github.com/Sxnjxy25/thermo-navigator...

git init
git remote remove origin 2>nul
git remote add origin https://github.com/Sxnjxy25/thermo-navigator.git
git add .
git commit -m "Clean Lovable references, fix calculation safeguards, and update README"
git branch -M main
git push -u origin main

echo.
echo Done! Updates pushed to https://github.com/Sxnjxy25/thermo-navigator
pause
