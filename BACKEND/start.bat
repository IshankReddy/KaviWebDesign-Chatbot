@echo off
start cmd /k "python -m uvicorn main:app --reload --port 8000"
start cmd /k "python data_vectorizer.py" 