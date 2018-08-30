@echo off
cls
echo Launching...
title SLGStatus
:start
node --trace-warnings ./ ./data/token.txt
echo Restarting...
goto start