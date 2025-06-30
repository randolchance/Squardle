from fastapi import FastAPI

from word_master import WordMaster


app = FastAPI()

WORDS = WordMaster()

@app.get("/words")
async def query_words(q: str):
    return WORDS.words.getWords(q)
