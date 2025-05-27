# backend/main.py

from fastapi import FastAPI
# No need for 'from typing import Optional' if you only use '|'

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello World from FastAPI!"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None): # This syntax is fine in Python 3.10+
    return {"item_id": item_id, "q": q}