#!/bin/bash

# Start the FastAPI server
python -m uvicorn main:app --reload --port 8000 &

# Start the data vectorizer
python data_vectorizer.py &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $? 