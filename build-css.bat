@echo off
echo Cleaning CSS directory...
del /q css\styles.min.css 2>nul
del /q css\styles.css 2>nul

echo Compiling SCSS to CSS...
call npm run scss:build
call npm run scss:expanded

echo Done!
