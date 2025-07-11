from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates as Templates
from starlette.config import Config
from starlette.datastructures import Secret
from starlette.middleware.sessions import SessionMiddleware

from puzzle_master import PuzzleMaster

config = Config("./config.env")

SECRET_KEY = config('SECRET_KEY', cast=Secret)
SESSION_EXPIRY = config('SESSION_EXPIRY', cast=int)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=str(SECRET_KEY),
    session_cookie="Squardle",
    max_age=SESSION_EXPIRY,
    same_site="strict",
    path="/p",
    #https_only=True,
)



templates = Templates(directory="dist")

app.mount("/assets", StaticFiles(directory="dist/assets"), name="static")

@app.get("/")
async def index(request: Request):
    
    response = templates.TemplateResponse("index.html",{"request": request})

    return response

@app.get("/words")
async def query_words(q: str):
    words = PuzzleMaster().words
    return words.getWords(q)

@app.get("/p/{p}/start")
async def start_puzzle(request: Request, p: int):
    puzzle_data = PuzzleMaster.initialiseNewPuzzle(p)

    request.session['current_puzzle'] = puzzle_data
    
    response = JSONResponse(status_code=status.HTTP_200_OK, content={
        'current_puzzle': puzzle_data
    })

    return response

@app.get("/p/test")
async def test(request: Request):
    puzzle_data = request.session.get('current_puzzle', {'current_puzzle': None})
    
    response = JSONResponse(status_code=status.HTTP_200_OK, content=puzzle_data)
    return response


@app.get("/p/guess")
async def guess_word(p: int, i: int, word: str, m: int):
    puzzleMaster = PuzzleMaster()
    if (not word.isascii()):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST)

    if (not puzzleMaster.isValidWord(word)):
        return JSONResponse(status_code=status.HTTP_200_OK, content=None)

    easy_mode = not bool(m)
    hints = puzzleMaster.guess(p, i, word, easy_mode)
    return JSONResponse(status_code=status.HTTP_200_OK, content=hints)