from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates as Templates

from word_master import WordMaster


templates = Templates(directory="dist")

app = FastAPI()

app.mount("/assets", StaticFiles(directory="dist/assets"), name="static")



@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html",{"request": request})

@app.get("/words")
async def query_words(q: str):
    words = WordMaster().words
    return words.getWords(q)

@app.get("/guess")
async def guess_word(p: int, i: int, word: str, m: int):
    wordMaster = WordMaster()
    if (not word.isascii()):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST)

    if (not wordMaster.isValidWord(word)):
        return JSONResponse(status_code=status.HTTP_200_OK, content=None)

    easy_mode = not bool(m)
    hints = wordMaster.guess(p, i, word, easy_mode)
    return JSONResponse(status_code=status.HTTP_200_OK, content=hints)