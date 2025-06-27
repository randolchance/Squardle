import {
    CHARACTER_KEYS,
    NON_CHARACTER_KEYS,
    DIRECTIONS,
    HINTS,
} from 'constants';

import Cell from './cell';


function setCellStatus( cell, status ) {
    switch (status) {
        case HINTS.correct:
            cell.correct = true;
            break;
        case HINTS.inWord:
            cell.inWord = true;
            break;
        case HINTS.inWordHorizontal:
            cell.inWordHorizontal = true;
            break;
        case HINTS.inWordVertical:
            cell.inWordVertical = true;
            break;
    }
}

const VALID_KEYS = CHARACTER_KEYS.concat(NON_CHARACTER_KEYS);

const DEFAULT_GRID_SIZE = 5;

class Grid {

    static onKeydown( event ) {
        event.preventDefault();

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
                    case 'Escape':
                        // Deselect all cells
                        break;
                    case 'ArrowUp':
                        break;
                    case 'Tab':
                    case 'ArrowRight':
                        // Move cursor right
                        break;
                    case 'ArrowDown':
                        break;
                    case 'ArrowLeft':
                        break;
                    case 'Enter':
                        // Submit word if complete
                        break;
                }
                break;
        }
    }

    /* Private instance properties */
    #controller;

    #size;
    #cells;
    #currentCell;
    #_direction;

    #onKeydown;

    constructor( controller, size=DEFAULT_GRID_SIZE ) {
        if (!controller) {
            throw new Error(`No controller given!`);
        }

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
                row.push( new Cell( i, j, this ) );
            }
            cells.push( row );
        }

        this.#controller = controller;

        this.#cells = cells;
        this.#currentCell = null;
        this.#_direction = DIRECTIONS.horizontal;

        this.#onKeydown = Grid.onKeydown.bind(this);

    }

    get size() {
        return this.#size;
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

    get currentWord() {
        if (!this.currentCell) return null;

        let word = '';
        switch (this.#direction) {
            case DIRECTIONS.horizontal:
                const j = this.currentCell.j;
                
                for (const cell of this.#cells[j]) {
                    if (!cell.content) return null;

                    word += cell.content;
                }
                break;
                
            case DIRECTIONS.vertical:
                const i = this.currentCell.i;
                
                for (const row of this.#cells) {
                    const cell = row[i];
                    if (!cell.content) return null;

                    word += cell.content;
                }
                break;
        }

        return word;
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
        if (!this.currentCell) {
            console.warn(`Keydown events activation attempted with no cell selected!`);
            return;
        }

        this.currentCell.element.addEventListener( 'keydown', this.#onKeydown );
    }

    disableKeys() {
        if (!this.currentCell) return;

        this.currentCell.element.removeEventListener( 'keydown', this.#onKeydown );
    }

    nextCell() {
        if (!this.currentCell) return;
        
        let cell = null;

        const size = this.size;
        const cells = this.#cells;
        switch (this.#direction) {
            case DIRECTIONS.horizontal:
                for (let j = this.currentCell.j; j < size; j++) {
                    for (let i = this.currentCell.i + 1; i < size; i++) {
                        if (cells[j][i].correct) continue;

                        cell = cells[j][i];
                        break;
                    }
                }
                break;

            case DIRECTIONS.vertical:
                for (let i = this.currentCell.i; i < size; i++) {
                    for (let j = this.currentCell.j + 1; j < size; j++) {
                        if (cells[j][i].correct) continue;
                        
                        cell = cells[j][i];
                        break;
                    }
                }
                break;
        }
        
        this.#currentCell = cell;

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

    submit() {
        const currentWord = this.currentWord;
        if (!currentWord) {
            this.#controller.incompleteWord();
            return;
        }

        this.deselectCell();

        const hints = this.#controller.submit( currentWord );
        this.#parseHints( hints );
    }

    #parseHints( hints ) {
        switch (this.#direction) {
            case DIRECTIONS.horizontal:
                const j = this.currentCell.j;
                for (let i = 0; i < this.size; i++) {
                    const cell = this.#cells[j][i];
                    if (cell.correct) continue;

                    setCellStatus( cell, hints[i] );
                }
                break;

            case DIRECTIONS.vertical:
                const i = this.currentCell.i;
                for (let j = 0; j < this.size; j++) {
                    const cell = this.#cells[j][i];
                    if (cell.correct) continue;

                    setCellStatus( cell, hints[j] );
                }
                break;
        }
    }

}