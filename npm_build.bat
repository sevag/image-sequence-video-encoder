@echo off
echo STEP 1 - BUILD EXE
echo ==================
echo NOTE - CLOSE 2ND CMD WINDOW WHEN BUILD IS FINISHED
echo ==================
start /w npm run build|ECHO N
echo STEP 2 - COPY FFMPEG TO BUILD FOLDER
echo ==================
ECHO F|xcopy /y /i .\ffmpeg.exe ".\release-builds\Britelite PNG Sequence Converter-win32-ia32\ffmpeg.exe"
echo ==================
echo BUILD COMPLETE!
echo ==================
pause