import json
import sqlite3
from enum import IntEnum
from collections import Counter

from trie import Trie


DATABASE_PATH = "./solutions/puzzles.db"
WORD_SIZE = 5

class Hints(IntEnum):
    UNUSED = 0
    IN_WORD = 1
    IN_WORD_HORIZONTAL = 3
    IN_WORD_VERTICAL = 5
    IN_BOTH = 7
    CORRECT = 8

class Modes(IntEnum):
    HARDEST = 0,
    ALL_HINTS = 1,    # Info about which word vertical or horizontal the letter is in

def parse_puzzle_string( puzzle_string ):
    puzzle_list = [*puzzle_string]
    return [ puzzle_list[ WORD_SIZE * i : WORD_SIZE * (i+1) ] for i in range(len(puzzle_list)) ]

def get_puzzle( number ):
    with sqlite3.connect( DATABASE_PATH ) as connection:
        cursor = connection.cursor()
        puzzle_string = cursor.execute("SELECT data FROM Puzzles WHERE rowid=?", (number,)).fetchone()[0]
    return parse_puzzle_string( puzzle_string )

def generate_letter_hint( letter, index, answer, is_horizontal ):
    if (answer[index] == letter):
        return Hints.CORRECT
    elif (answer.find(letter) == -1):
        return Hints.UNUSED
    else:
        return Hints.IN_WORD_HORIZONTAL if is_horizontal else Hints.IN_WORD_VERTICAL
    
def generate_word_correct_hints( word, answer ):
    return [ Hints.CORRECT if letter == answer[i] else None for i, letter in enumerate(word) ]

def create_fresh_puzzle_state(word_size=WORD_SIZE):
    span = range(word_size)
    return [ ['_' for _ in span] for _ in span ]

class PuzzleMaster:
    Modes = Modes

    word_library = {
        5: "./5-word-trie.json",
    }

    @staticmethod
    def countPuzzles(word_size):
        with sqlite3.connect( DATABASE_PATH ) as connection:
            cursor = connection.cursor()
            puzzle_count = cursor.execute("SELECT COUNT(*) FROM Puzzles WHERE size=(?)", (word_size,)).fetchone()[0]
        return puzzle_count

    # Updates a puzzle_state in-place with letters that are correct
    @staticmethod
    def updateStateFromWordHints(puzzle_state, word, hints, index, is_horizontal):
        word_size = len(word)
        if is_horizontal:
            puzzle_size = len(puzzle_state[index])
            if word_size != puzzle_size:
                raise Exception(f"Given word has length {word_size} while puzzle has {puzzle_size}")
            
            for i, letter in enumerate(word):
                if hints[i] != Hints.CORRECT: continue

                puzzle_state[index][i] = letter

        else:
            puzzle_size = len(puzzle_state)
            if word_size != puzzle_size:
                raise Exception(f"Given word has length {word_size} while puzzle has {puzzle_size}")
            
            for j, letter in enumerate(word):
                if hints[j] != Hints.CORRECT: continue

                puzzle_state[j][index] = letter

        return puzzle_state
        
    @staticmethod
    def getWordFromState(puzzle_state, index, is_horizontal):
        if is_horizontal:
            return "".join(puzzle_state[index])
        else:
            return "".join([ row[index] for row in puzzle_state ])

    @staticmethod
    def initialiseNewPuzzle(p, mode, word_size=WORD_SIZE):
        if mode not in Modes:
            mode = Modes.ALL_HINTS
        
        return {
            'data': create_fresh_puzzle_state(word_size),
            'p': p,
            'm': mode,
            's': word_size,
        }

    def __init__(self, word_size=WORD_SIZE):
        if word_size not in PuzzleMaster.word_library.keys():
            raise Exception(f"word_size of {word_size} has no word library")
        
        with open(PuzzleMaster.word_library[word_size]) as file:
            self.words = Trie(json.loads(file.read()))

        self.word_size = word_size

        self.puzzle_count = PuzzleMaster.countPuzzles(word_size)

        self.puzzles = {}

    # word_index is 0 >= word_index > 2*self.word_size, such that
    # 0 >= word_index > self.word_size is the j index of the horizontal word in 
    # puzzle and self.word_size >= word_index > 2*self.word_size is the i index
    # of the vertical word in puzzle
    def parseWordIndex(self, word_index):
        if word_index >= 2*self.word_size:
            raise Exception(f"word_index of {word_index} is not valid for a puzzle with word_size {self.word_size}")

        is_horizontal = word_index < self.word_size
        index = word_index % self.word_size
        return index, is_horizontal

    def isValidWord(self, word):
        return word in self.words.getWords(word)
    
    def getPuzzleIndex(self, p):
        return (p + 44) * 10 % self.puzzle_count + 1
    
    def fetchPuzzle(self, p):
        puzzle = self.puzzles.get(p)
        if puzzle: return puzzle

        puzzle = get_puzzle( self.getPuzzleIndex(p) )
        self.puzzles[p] = puzzle

        return puzzle

    def guess(self, p, puzzle_state, guessed_word, word_index, easy_mode=False):
        puzzle = self.fetchPuzzle(p)

        span = range(self.word_size)

        index, is_horizontal = self.parseWordIndex(word_index)

        # Get all the perpendicular words as given in the player's game state
        guessed_perpendicular_words = \
            [ PuzzleMaster.getWordFromState(puzzle_state, i, not is_horizontal) for i in span ]
        
        # Get the correct word for the index in the puzzle
        correct_word = "".join(puzzle[index]) if is_horizontal \
            else "".join([puzzle[j][index] for j in span])
        
        # Get all the words in the perpendicular direction
        perpendicular_words = [ "".join([puzzle[j][i] for j in span]) for i in span ] \
            if is_horizontal else [ "".join(row) for row in puzzle ]

        # Keep a count of the letters in the correct word
        letter_count = Counter(correct_word)
        
        # Create list for populating hints into
        hints = generate_word_correct_hints(guessed_word, correct_word)

        # Remove correct letters from the letter_count
        for i, letter in enumerate(correct_word):
            if hints[i] == Hints.CORRECT:
                letter_count[letter] -= 1

        # Generate hints or each letter in the player's guessed word
        for i, letter in enumerate(guessed_word):
            if hints[i] == Hints.CORRECT: continue

            hint = Hints.UNUSED

            # Only generate a hint from letters in the correct_word that still remain in letter_count
            if letter in letter_count and letter_count[letter] > 0:
                hint = generate_letter_hint( letter, i, correct_word, is_horizontal )
                letter_count[letter] -= 1

            # If the letter is correct in correct_word it would be correct in the perpendicular word
            if hint != Hints.CORRECT:
                perpendicular_word = perpendicular_words[i]

                # Keep count of the letters in the perpendicular word, minus any letters that have
                # been verified to be correct
                other_letter_count = Counter(perpendicular_word) \
                    - Counter(guessed_perpendicular_words[i])

                # Only generate a hint from a perpendicular word if the letter is in it
                # and hasn't already been hinted
                if letter in other_letter_count and other_letter_count[letter] > 0:

                    hint = hint | generate_letter_hint( letter, index, perpendicular_word, not is_horizontal )
                    other_letter_count[letter] -= 1

                # If not in easy mode filter out hints about which word (horizontal 
                # or vertical) the letters are in
                if not easy_mode:
                    hint = hint & Hints.IN_WORD

            hints[i] = hint

        PuzzleMaster.updateStateFromWordHints(
            puzzle_state, guessed_word, hints, index, is_horizontal
        )

        return hints
