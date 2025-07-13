from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates as Templates
from starlette.config import Config
from starlette.datastructures import Secret
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel

from puzzle_master import PuzzleMaster


class GuessData(BaseModel):
    word: str
    word_index: int

config = Config("./config.env")

SECRET_KEY = config('SECRET_KEY', cast=Secret)
SESSION_EXPIRY = config('SESSION_EXPIRY', cast=int) * 60 * 60   # Convert to seconds

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET","POST","OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=str(SECRET_KEY),
    session_cookie="Squardle",
    max_age=SESSION_EXPIRY,
    same_site="Lax",
    path="/p",
    https_only=False,
)



templates = Templates(directory="dist")

app.mount("/assets", StaticFiles(directory="dist/assets"), name="static")

@app.get("/p")
async def index(request: Request):
    
    response = templates.TemplateResponse("index.html",{"request": request})

    return response

@app.get("/words")
async def query_words(q: str):
    words = PuzzleMaster().words
    return words.getWords(q)

@app.get("/p/{p}/start")
async def start_puzzle(request: Request, p:int, m: int):
    puzzle_data = PuzzleMaster.initialiseNewPuzzle(p, m)

    request.session.update({'current_puzzle': puzzle_data})
    
    response = JSONResponse(status_code=status.HTTP_200_OK, content={
        'current_puzzle': puzzle_data
    })

    return response

@app.get("/p/test")
async def test(request: Request):
    puzzle_data = request.session.get('current_puzzle', {'current_puzzle': None})
    
    response = JSONResponse(status_code=status.HTTP_200_OK, content=puzzle_data)
    return response


@app.post("/p/guess")
async def guess_word(request: Request, guessData: GuessData):
    word, word_index = guessData.model_dump().values()

    if (not word.isascii()):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=None)
    
    current_puzzle_data = request.session.get('current_puzzle')
    if not current_puzzle_data:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=None)
    
    # Get current state of the current_puzzle from the session
    p = current_puzzle_data['p']
    mode = current_puzzle_data['m']
    word_size = current_puzzle_data['s']
    current_puzzle_state = current_puzzle_data['data']

    puzzleMaster = PuzzleMaster(word_size)

    if (not puzzleMaster.isValidWord(word)):
        return JSONResponse(status_code=status.HTTP_200_OK, content=None)

    hints = puzzleMaster.guess(p, i, word, easy_mode)
    easy_mode = mode == PuzzleMaster.Modes.ALL_HINTS
    return JSONResponse(status_code=status.HTTP_200_OK, content=hints)