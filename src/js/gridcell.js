import { CHARACTER_KEYS } from 'constants';
import { HINTS } from './constants';

export default class GridCell {

    /* Bindables */
    static onClick( event ) {
        event.preventDefault();

        this.keysEnabled = true;
        
        this.grid.clickCell( this );
    }

    /* Private instance properties */
    #i;
    #j;
    #grid;
    #content;
    #locked;
    #correct;
    #inWord;
    #inHorizontalWord;
    #inVerticalWord;

    #hint;

    constructor( i, j, grid ) {
        if (typeof i !== 'number' || typeof j !== 'number') {
            throw new Error(`Index is invalid! Given: ${i}, ${j}`);
        } else if (Math.min(0,i,j) < 0 || Math.max(grid.size,i,j) > grid.size) {
            throw new Error(`Indexes ${i}, ${j} are out of bounds! grid size is ${grid.size}`);
        }

        this.#i = i;
        this.#j = j;

        this.#grid = grid;

        this.#content = null;

        this.#locked = false;
        this.#correct = false;

        this.#hint = null;

        this.onClick = GridCell.onClick.bind(this);

    }

    get i() {
        return this.#i;
    }

    get j() {
        return this.#j;
    }

    get grid() {
        return this.#grid;
    }

    get content() {
        return this.#content;
    }

    get locked() {
        return this.#locked;
    }

    get hint() {
        return this.#hint;
    }

    set hint( hint ) {
        if (!Object.values(HINTS)) {
            throw new Error(`Invalid hint enum! Given: ${ hint }`);
        }

        if (hint === HINTS.correct) this.#correct = is_correct;

        this.#hint = hint;
    }

    get correct() {
        return this.#correct;
    }

    get disabled() {
        return this.#correct || this.#locked;
    }

    get selected() {
        return this === this.grid.currentCell;
    }

    lock() {
        this.#locked = true;
    }

    write( key ) {
        if (!CHARACTER_KEYS.includes( key )) {
            console.warn(`${ key } is not a valid key to write to a cell`);
            return;
        } else if (this.correct) {
            this.#warnIsCorrect();
            return;
        }

        this.#content = key.toUpperCase();

    }

    clear() {
        if (this.correct) {
            this.#warnIsCorrect();
            return;
        }

        this.#content = null;

    }

    #warnIsCorrect() {
        console.warn(`This cell is correct and cannot be changed.`);
    }

}