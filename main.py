from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from word_master import WordMaster


app = FastAPI()

app.mount("/", StaticFiles(directory="dist", html=True), name="static")

WORDS = WordMaster()

@app.get("/words")
async def query_words(q: str):
    return WORDS.words.getWords(q)

@app.get("/guess")
async def guess_word(p: int, i: int, word: str, m: int):
    if (not WORDS.isValidWord(word)): return None

    puzzle_index = WORDS.getPuzzleIndex(p)
    easy_mode = not bool(m)
    return WORDS.guess(puzzle_index, i, word, easy_mode)