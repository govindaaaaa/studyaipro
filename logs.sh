#!/bin/bash

# View logs in real-time

if [ "$1" == "backend" ]; then
    tail -f logs/backend.log
elif [ "$1" == "rag" ]; then
    tail -f logs/rag.log
elif [ "$1" == "frontend" ]; then
    tail -f logs/frontend.log
else
    echo "Usage: ./logs.sh [backend|rag|frontend]"
    echo ""
    echo "Or view all logs:"
    echo "  tail -f logs/*.log"
fi
