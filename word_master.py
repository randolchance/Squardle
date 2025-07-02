import json
import sqlite3
from enum import IntEnum
from collections import Counter

from trie import Trie


DATABASE_PATH = "./solutions/puzzles.db"
PUZZLE_COUNT = 81
WORD_SIZE = 5

class Hints(IntEnum):
    UNUSED = 0
    IN_WORD = 1
    IN_WORD_HORIZONTAL = 3
    IN_WORD_VERTICAL = 5
    IN_BOTH = 7
    CORRECT = 8

def parse_puzzle_string( puzzle_string ):
    return [ puzzle_string[ WORD_SIZE * i : WORD_SIZE * (i+1) ] for i in range(len(puzzle_string)) ]

def get_puzzle( number ):
    with sqlite3.connect( DATABASE_PATH ) as connection:
        cursor = connection.cursor()
        puzzle_string = cursor.execute("SELECT data FROM Puzzles WHERE rowid=?", (number,)).fetchone()[0]
    return parse_puzzle_string( puzzle_string )

def generate_letter_hint( letter, index, answer, is_horizontal ):
    if ((i := answer.find(letter)) == -1):
        return Hints.UNUSED
    elif (i == index):
        return Hints.CORRECT
    else:
        return Hints.IN_WORD_HORIZONTAL if is_horizontal else Hints.IN_WORD_VERTICAL


class WordMaster:
    def __init__(self, word_size=WORD_SIZE):
        with open("./word-trie.json") as file:
            self.words = Trie(json.loads(file.read()))

        self.word_size = word_size

    def isValidWord(self, word):
        return word in self.words.getWords(word)
    
    def getPuzzleIndex(self, p):
        return (p + 44) * 10 % PUZZLE_COUNT + 1

    def guess(self, p, word_index, word, easy_mode=False):

        # Parse p into the database rowid
        puzzle_index = self.getPuzzleIndex(p)

        # word_index param is 0 >= word_index > 2*self.word_size, such that
        # 0 >= word_index > self.word_size is the j index of the horizontal word in 
        # puzzle and self.word_size >= word_index > 2*self.word_size is the i index
        # of the vertical word in puzzle
        is_horizontal = word_index < self.word_size
        word_index = word_index % self.word_size

        puzzle = get_puzzle( puzzle_index )

        span = range(self.word_size)

        # Get the correct word for the word_index in the puzzle
        answer = puzzle[word_index] if is_horizontal \
            else "".join([puzzle[j][word_index] for j in span])
        
        # Get all the words in the opposite direction
        other_answers = ["".join([puzzle[j][i] for j in span]) for i in span] \
            if is_horizontal else puzzle

        letter_count = Counter(word)
        
        hints = [None] * self.word_size
        for i, letter in enumerate(word):
            hint = Hints.UNUSED

            if letter in letter_count and letter_count[letter] > 0:
                hint = generate_letter_hint( letter, i, answer, is_horizontal )
                letter_count[letter] -= 1

            if hint != Hints.CORRECT:
                # Generate the hint from the letter in the perpendicular word
                other_word = other_answers[i]
                other_letter_count = Counter(other_word)

                if letter in other_letter_count and other_letter_count[letter] > 0:

                    hint = hint | generate_letter_hint( letter, word_index, other_word, not is_horizontal )
                    other_letter_count[letter] -= 1

                # If not in easy mode filter out hints about which word (horizontal 
                # or vertical) the letters are in
                if not easy_mode:
                    hint = hint & Hints.IN_WORD

            hints[i] = hint

        return hints

