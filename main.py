from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates as Templates
from starlette.config import Config
from starlette.datastructures import Secret
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel

from puzzle_master import PuzzleMaster

VALID_WORD_SIZES = PuzzleMaster.word_library.keys()

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
    path="/",
    https_only=False,
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

@app.get("/p/{word_size}/{p}/start")
async def start_puzzle(request: Request, word_size: int, p: int, m: int):
    current_puzzle = request.session.get(word_size)
    current_puzzle_details = current_puzzle.get(p) if current_puzzle else None
    current_mode = current_puzzle_details.get('m') if current_puzzle_details else m

    if not current_puzzle or not current_puzzle_details or current_mode != m:
        current_puzzle = PuzzleMaster.initialiseNewPuzzle(p, m).get(word_size)
        current_puzzle_details = current_puzzle.get(p)
        current_mode = m

    request.session.update({
        word_size: {
            'current_puzzle': p,
            p: current_puzzle_details
        }
    })

    response = JSONResponse(status_code=status.HTTP_200_OK, content={
        'current_puzzle': current_puzzle_details.get('data')
    })

    return response

@app.get("/reset")
async def test(request: Request):
    request.session.clear()
    return JSONResponse(status_code=status.HTTP_200_OK, content="reset")


@app.get("/list/{word_size}")
async def test(request: Request, word_size: int):
    if not word_size in VALID_WORD_SIZES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid_word_size")
    
    puzzle_count = PuzzleMaster.countPuzzles(word_size)
    
    return JSONResponse(status_code=status.HTTP_200_OK, content=puzzle_count)

@app.post("/p/{word_size}/{p}/guess")
async def guess_word(request: Request, word_size: int, p: int, guessData: GuessData):
    word, word_index = guessData.model_dump().values()

    if (not word.isascii()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid_word_content")
    
    # Get current state of the current_puzzle from the session
    current_puzzle = request.session.get(str(word_size))
    if not current_puzzle:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no_puzzle_started")
    
    # Prevent users from guessing at a puzzle that isn't current?
    current_p = current_puzzle.get('current_puzzle')
    if not current_p or p != current_p:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="puzzle_mismatch")
    
    current_puzzle_details = current_puzzle.get(str(p))
    
    mode = current_puzzle_details.get('m')
    current_puzzle_state = current_puzzle_details.get('data')

    puzzleMaster = PuzzleMaster(word_size)

    # If the word is not in the library then there are no hints to return
    if (not puzzleMaster.isValidWord(word)):
        return JSONResponse(status_code=status.HTTP_200_OK, content=None)

    easy_mode = mode == PuzzleMaster.Modes.ALL_HINTS

    # Updates the state of the current_puzzle and provides the hints for
    # the guessed word
    hints = puzzleMaster.guess(p, current_puzzle_state, word, word_index, easy_mode)

    return JSONResponse(status_code=status.HTTP_200_OK, content=hints)