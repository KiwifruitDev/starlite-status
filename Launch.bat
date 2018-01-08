@echo off
cls
echo Launching...
title SLGStatus
:start
node --trace-warnings ./ ./token.txt
echo Restarting...
goto start