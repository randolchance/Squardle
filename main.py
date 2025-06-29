from typing import Annotated

from fastapi import FastAPI, Query

from word_master import WordMaster


app = FastAPI()

WORDS = WordMaster()

@app.get("/words")
async def query_words(q: Annotated[str, Query(min_length=1, max_length=5)]):
    return WORDS.words.getWords(q)