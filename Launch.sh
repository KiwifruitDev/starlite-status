#!/bin/bash
running=1
echo "Launching..."
while (( running )); do
    node --trace-warnings ./ ./token.txt
    echo "Restarting..."
done