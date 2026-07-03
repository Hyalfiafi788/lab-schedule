@echo off
setlocal
cd /d "%~dp0"
echo Creating Lab Schedule Pro Setup.exe ...
copy /b LabScheduleProSetup.exe.part00+LabScheduleProSetup.exe.part01+LabScheduleProSetup.exe.part02 "Lab Schedule Pro Setup.exe"
if errorlevel 1 (
  echo Failed to create EXE. Make sure all .part files are in this folder.
  pause
  exit /b 1
)
echo Done: Lab Schedule Pro Setup.exe
certutil -hashfile "Lab Schedule Pro Setup.exe" SHA256
echo Expected SHA256:
echo 804743705b059c22fc435b94e6407bdbe4d0c2c1c56c71ddedddc607d80b9852
pause
