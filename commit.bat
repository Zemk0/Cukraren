@echo off
REM -------------------------------------------
REM Auto Git Add, Commit, and Push Script
REM -------------------------------------------

REM Set your commit message here
set /p commitMessage=Enter commit message: 

REM Navigate to your Git repository (optional)
REM cd "C:\path\to\your\repo"

echo.
echo Staging all changes...
git add .

echo.
echo Committing changes...
git commit -m "%commitMessage%"

echo.
echo Pushing to remote...
git push

echo.
echo Done!
pause
