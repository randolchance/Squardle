from fastapi import FastAPI
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates as Templates

from word_master import WordMaster


templates = Templates(directory="dist")

app = FastAPI()

app.mount("/assets", StaticFiles(directory="dist/assets"), name="static")

WORDS = WordMaster()

@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html",{"request": request})

@app.get("/words")
async def query_words(q: str):
    return WORDS.words.getWords(q)

@app.get("/guess")
async def guess_word(p: int, i: int, word: str, m: int):
    if (not WORDS.isValidWord(word)): return None

    puzzle_index = WORDS.getPuzzleIndex(p)
    easy_mode = not bool(m)
    return WORDS.guess(puzzle_index, i, word, easy_mode)