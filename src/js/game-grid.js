import {
    DEFAULT_GRID_SIZE,
    CHARACTER_KEYS,
    NON_CHARACTER_KEYS,
    VALID_KEYS,
    DIRECTIONS,
    HINTS,
    MODES,
} from 'constants';

import GridCell from './grid-cell';


export default class GameGrid {

    static onKeydown( event ) {
        const { key } = event;
        if (!VALID_KEYS.includes(key)) return;

        if (!this.currentCell) {
            console.warn(`Keydown event is active but no cell is selected!`);
            return;
        }

        switch (true) {
            case CHARACTER_KEYS.includes(key):
                this.writeCell( key );
                break;
            case NON_CHARACTER_KEYS.includes(key):
                switch (key) {
                    case 'Tab':
                        this.toggleDirection();
                        break;
                    case 'Escape':
                        this.deselectCell();
                        break;
                    case 'ArrowUp':
                        switch (this.direction) {
                            case DIRECTIONS.horizontal:
                                this.previousWord();
                                break;
                            case DIRECTIONS.vertical:
                                this.previousCell();
                                break;
                        }
                        break;
                    case 'ArrowRight':
                        switch (this.direction) {
                            case DIRECTIONS.horizontal:
                                this.nextCell();
                                break;
                            case DIRECTIONS.vertical:
                                this.nextWord();
                                break;
                        }
                        break;
                    case 'ArrowDown':
                        switch (this.direction) {
                            case DIRECTIONS.horizontal:
                                this.nextWord();
                                break;
                            case DIRECTIONS.vertical:
                                this.nextCell();
                                break;
                        }
                        break;
                    case 'ArrowLeft':
                        switch (this.direction) {
                            case DIRECTIONS.horizontal:
                                this.previousCell();
                                break;
                            case DIRECTIONS.vertical:
                                this.previousWord();
                                break;
                        }
                        break;
                    case 'Enter':
                        this.submit();
                        break;
                    case 'Backspace':
                        this.clearCell();
                        this.previousCell();
                        break;
                    
                }
                break;
        }
    }

    /* Private instance properties */
    #guessController;
    #puzzle_number;
    #mode;

    #disabled;

    #size;
    #cells;
    #currentCell;
    #direction;

    constructor( guessController, puzzle_number, mode=MODES.normal, size=DEFAULT_GRID_SIZE ) {
        if (typeof size !== 'number') {
            throw new Error(`size is not a number! Given: ${size}`);
        } else if (size < 0) {
            throw new Error(`size cannot be negative! Given: ${size}`);
        }

        this.#size = size;

        const cells = [];
        for (let j = 0; j < size; j++) {
            const row = [];
            for (let i = 0; i < size; i++) {
                row.push( new GridCell( i, j, this ) );
            }
            cells.push( row );
        }

        this.#guessController = guessController;

        this.#puzzle_number = puzzle_number;
        this.#mode = mode;

        this.#disabled = false;

        this.#cells = cells;
        this.#currentCell = null;
        this.#direction = DIRECTIONS.horizontal;

        this.onKeydown = GameGrid.onKeydown.bind(this);

    }

    get mode() {
        return this.#mode;
    }

    get disabled() {
        return this.#disabled;
    }

    set disabled( state ) {
        this.#disabled = Boolean( state );
    }

    get size() {
        return this.#size;
    }

    get cells() {
        return this.#cells;
    }

    get currentCell() {
        return this.#currentCell;
    }

    get direction() {
        return this.#direction;
    }

    set direction( direction ) {
        this.#direction = direction;
    }

    get currentRowIndex() {
        return this.currentCell ? this.currentCell.i : null;
    }

    get currentColumnIndex() {
        return this.currentCell ? this.currentCell.j : null;
    }

    get currentRow() {
        return function*() {
            if (!this.currentCell) return;

            const currentRowIndex = this.currentRowIndex;
            for (let i = 0; i < this.size; i++) {
                yield this.cells[currentRowIndex][i];
            }
        }
    }

    get currentColumn() {
        return function*() {
            if (!this.currentCell) return;

            const currentColumnIndex = this.currentColumnIndex;
            for (let j = 0; j < this.size; j++) {
                yield this.cells[j][currentColumnIndex];
            }
        }
    }

    get currentWordCells() {
        const target = this.direction === DIRECTIONS.horizontal
            ? this.currentRow
            : this.currentColumn;

        for (const cell of target) yield cell;
    }

    get current_word() {

        let word = '';
        for (const cell of this.currentWordCells) word += cell.content;

        return word;
    }

    get word_index() {
        if (!this.currentCell) return null;

        return this.direction === DIRECTIONS.horizontal ?
            this.currentRowIndex : this.size + this.currentColumnIndex;
    }

    get is_solved() {
        for (const row of this.cells) {
            for (const cell of row) {
                if (!cell.correct) return false;
            }
        }
        return true;
    }

    get currentFirstCell() {
        return this.currentWordCells.next().value;
    }

    get currentLastCell() {
        const { i, j } = this.currentCell;
        switch (this.direction) {
            case DIRECTIONS.horizontal:
                return this.cells[j][0];
            case DIRECTIONS.vertical:
                return this.cells[0][i];
        }
    }

    toggleDirection() {
        switch (this.direction) {
            case DIRECTIONS.horizontal:
                if (this.currentCell.locked & DIRECTIONS.vertical) return;

                this.direction = DIRECTIONS.vertical;
                break;

            case DIRECTIONS.vertical:
                if (this.currentCell.locked & DIRECTIONS.horizontal) return;

                this.direction = DIRECTIONS.horizontal;
                break;
        }

        this.#guessController.select( this.word_index );

    }

    clickCell( cell ) {
        if (cell === this.#currentCell) {

            this.toggleDirection();

        } else {

            this.selectCell( cell.i, cell.j );

        }
    }

    selectCell( i, j ) {
        if (i < 0 || j < 0 || i >= this.size || j >= this.size) {
            this.deselectCell();
            return;
        }

        const cell = this.#cells[j][i];
        if (cell.correct || cell.locked === DIRECTIONS.both) {
            this.deselectCell();
            return;
        }

        this.disableKeys();

        this.#currentCell = cell;

        if (this.direction & cell.locked) {
            
            this.toggleDirection();
        
        } else {

            this.#guessController.selected_word_index = this.word_index;

        }

        this.enableKeys();
        
    }

    deselectCell() {

        this.#currentCell = null;

    }

    selectCurrentFirstCell() {
        const { i, j } = this.currentFirstCell;

        this.selectCell( i, j );
    }

    selectCurrentLastCell() {
        const { i, j } = this.currentLastCell;

        this.selectCell( i, j );
    }
        if (!cell) return;

        this.selectCell( cell.i, cell.j );
    }
    
    enableKeys() {
        if (!this.currentCell) return;

        this.currentCell.keysEnabled = true;
    }

    disableKeys() {
        if (!this.currentCell) return;

        this.currentCell.keysEnabled = false;
    }

    nextCell() {
        if (!this.currentCell) return;

        const size = this.size;
        const cells = this.#cells;
        let i = this.currentRowIndex;
        let j = this.currentColumnIndex;
        switch (this.direction) {
            case DIRECTIONS.horizontal:
                for (i += 1; i < size; i++) {
                    if (!cells[j][i].disabled) break;
                }
                break;

            case DIRECTIONS.vertical:
                for (j += 1; j < size; j++) {
                    if (!cells[j][i].disabled) break;
                }
                break;
        }
        
        this.selectCell( i, j );

        if (!this.currentCell) this.nextWord();

    }

    previousCell() {
        if (!this.currentCell) return;

        const cells = this.#cells;
        let i = this.currentRowIndex;
        let j = this.currentColumnIndex;
        switch (this.direction) {
            case DIRECTIONS.horizontal:
                for (i -= 1; i >= 0; i--) {
                    if (!cells[j][i].disabled) break;
                }
                break;

            case DIRECTIONS.vertical:
                for (j -= 1; j >= 0; j--) {
                    if (!cells[j][i].disabled) break;
                }
                break;
        }
        
        this.selectCell( i, j );

        if (!this.currentCell) this.previousWord();

    }

    nextWord() {
        if (!this.currentCell || this.is_solved) return;

        switch (this.direction) {
            case DIRECTIONS.horizontal:

                let j = this.currentRowIndex + 1;
                do {

                    this.selectCell( 0, j++ );

                } while (!this.currentCell && j < this.size);

                break;

            case DIRECTIONS.vertical:

                let i = this.currentColumnIndex + 1;
                do {

                    this.selectCell( 0, i++ );

                } while (!this.currentCell && i < this.size);

                break;
        }

        if (!this.currentCell) {

            this.toggleDirection();

        }

    }

    previousWord() {
        if (!this.currentCell || this.is_solved) return;
        
        switch (this.direction) {
            case DIRECTIONS.horizontal:

                let j = this.currentRowIndex - 1;
                do {

                    this.selectCell( 0, j-- );

                } while (!this.currentCell && j >= 0);

                break;

            case DIRECTIONS.vertical:

                let i = this.currentColumnIndex - 1;
                do {

                    this.selectCell( i--, 0 );

                } while (!this.currentCell && i >= 0);

                break;
        }

        if (!this.currentCell) {

            this.toggleDirection();

        }

    }

    #lockWord() {

        for (const cell of this.currentWordCells) cell.lock( this.direction ^ DIRECTIONS.both );

    }

    async submit() {
        const current_word = this.current_word;
        if (!current_word) {

            this.#incompleteWord();

            return;
        }

        const params = new URLSearchParams({
            p: this.#puzzle_number,
            i: this.word_index,
            word: current_word,
            m: this.mode,
        });

        let hints;
        try {

            const response = await fetch(`/guess?${params}}`);

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            hints = response.json();

        } catch (e) {

            console.error(e.message);

            // Do something with the error and pass it to this.#error

            this.#error();

            return;
        }

        if (!hints) {

            this.#invalidWord();

            this.selectCurrentFirstCell();

            return;
        }

        this.#parseHints( hints );

        const correct_guess = hints.every( hint => hint === HINTS.correct );

        const remaining_guesses = this.#guessController.guess( this.current_word, hints );
        if (remaining_guesses == 0) {

            this.#lockWord();

            this.nextWord();
        
        } else if (correct_guess) {
            
            this.nextWord();
        
        } else {

            this.selectCurrentFirstCell();

        }

        if (!this.currentCell) {

            // Win condition because there are no words left to select

        }
        
    }

    #error() {

    }

    #incompleteWord() {

    }

    #invalidWord() {

    }

    #parseHints( hints ) {
        for (const [cell, h] of [...this.currentWordCells].map( (cell, h) => [cell, h] )) {
            if (cell.correct) continue;

            cell.hint = hints[h];
        }
    }

}