import {
    DEFAULT_GRID_SIZE,
    CHARACTER_KEYS,
    NON_CHARACTER_KEYS,
    VALID_KEYS,
    DIRECTIONS,
    HINTS,
    MODES,
} from 'constants';

import GridCell from './gridcell';


export default class GameGrid {

    static onKeydown( event ) {
        const { key } = event;
        if (!VALID_KEYS.includes(key)) return;

        const cell = this.currentCell;
        if (!cell) {
            console.warn(`Keydown event is active but no cell is selected!`);
            return;
        }

        switch (true) {
            case CHARACTER_KEYS.includes(key):
                cell.write( key );
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
                        this.previousWord();
                        break;
                    case 'ArrowRight':
                        this.nextCell();
                        break;
                    case 'ArrowDown':
                        this.nextWord();
                        break;
                    case 'ArrowLeft':
                        this.previousCell();
                        break;
                    case 'Enter':
                        // Submit word if complete
                        this.submit();
                        break;
                    case 'Backspace':
                        cell.clear();
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
    #_direction;

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
        this.#_direction = DIRECTIONS.horizontal;

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

    get #direction() {
        return this.#_direction;
    }

    set #direction( direction ) {
        this.#_direction = direction;
    }

    get currentRowIndex() {
        return this.currentCell ? this.currentCell.i : null;
    }

    get currentColumnIndex() {
        return this.currentCell ? this.currentCell.j : null;
    }

    get currentRow() {
        return function*() {
            const currentRowIndex = this.currentRowIndex;
            for (let i = 0; i < this.size; i++) {
                yield this.cells[currentRowIndex][i];
            }
        }
    }

    get currentColumn() {
        return function*() {
            const currentColumnIndex = this.currentColumnIndex;
            for (let j = 0; j < this.size; j++) {
                yield this.cells[j][currentColumnIndex];
            }
        }
    }

    get current_word() {
        if (!this.currentCell) return null;

        let word = '';
        switch (this.#direction) {
            case DIRECTIONS.horizontal:
                for (const cell of this.currentRow) {
                    if (!cell.content) return null;

                    word += cell.content;
                }
                break;
                
            case DIRECTIONS.vertical:
                for (const cell of this.currentColumn) {
                    if (!cell.content) return null;

                    word += cell.content;
                }
                break;
        }

        return word;
    }

    get word_index() {
        return this.#direction === DIRECTIONS.horizontal ?
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

    toggleDirection() {
        switch (this.#direction) {
            case DIRECTIONS.horizontal:
                this.#direction = DIRECTIONS.vertical;
                break;

            case DIRECTIONS.vertical:
                this.#direction = DIRECTIONS.horizontal;
                break;
        }
    }

    clickCell( cell ) {
        if (cell === this.#currentCell) {

            this.toggleDirection();

        } else {

            this.selectCell( cell.i, cell.j );

        }
    }

    selectCell( i, j ) {
        if (i >= this.size || j >= this.size) {
            this.deselectCell();
            return;
        }

        const cell = this.#cells[j][i];
        if (cell.correct) {
            this.deselectCell();
            return;
        }

        this.disableKeys();

        this.#currentCell = cell;

        this.enableKeys();
        
    }

    deselectCell() {

        this.#currentCell = null;

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
        switch (this.#direction) {
            case DIRECTIONS.horizontal:
                for (i += 1; i < size; i++) {
                    if (!cells[j][i].correct) break;
                }
                break;

            case DIRECTIONS.vertical:
                for (j += 1; j < size; j++) {
                    if (!cells[j][i].correct) break;
                }
                break;
        }
        
        this.selectCell( i, j );
    }

    previousCell() {
        if (!this.currentCell) return;

        const cells = this.#cells;
        let i = this.currentRowIndex;
        let j = this.currentColumnIndex;
        switch (this.#direction) {
            case DIRECTIONS.horizontal:
                for (i -= 1; i >= 0; i--) {
                    if (!cells[j][i].correct) break;
                }
                break;

            case DIRECTIONS.vertical:
                for (j -= 1; j >= 0; j--) {
                    if (!cells[j][i].correct) break;
                }
                break;
        }
        
        this.selectCell( i, j );
    }

    nextWord() {
        if (!this.currentCell) return;

        let j = this.currentCell.j + 1;
        do {

            this.selectCell( 0, j++ );

        } while (!this.currentCell && j < this.size);

    }

    previousWord() {
        if (!this.currentCell) return;

        let j = this.currentCell.j - 1;
        do {

            this.selectCell( 0, j-- );

        } while (!this.currentCell && j >= 0);

    }

    #lockWord() {
        switch (this.#direction) {
            case DIRECTIONS.horizontal:
                for (const cell of this.currentRow) {
                    cell.lock();
                }
                break;
                
            case DIRECTIONS.vertical:
                for (const cell of this.currentColumn) {
                    cell.lock();
                }
                break;
        }

        return word;

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

        try {

            const response = await fetch(`/guess?${params}}`);

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const hints = response.json();
            this.#parseHints( hints );

        } catch (e) {

            console.error(e.message);

            // Do something with the error and pass it to this.#error

            this.#error();

        }

        
    }

    #error() {

    }

    #incompleteWord() {

    }


    #parseHints( hints ) {
        switch (this.#direction) {
            case DIRECTIONS.horizontal:
                for (const [cell, h] of [...this.currentRow].map( (cell, h) => [cell, h] )) {
                    if (cell.correct) continue;

                    cell.hint = hints[h];
                }
                break;

            case DIRECTIONS.vertical:
                for (const [cell, h] of [...this.currentColumn].map( (cell, h) => [cell, h] )) {
                    if (cell.correct) continue;

                    cell.hint = hints[h];
                }
                break;
        }
    }

}