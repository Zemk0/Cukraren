@echo off

set /p commitMessage=Enter commit message: 

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
