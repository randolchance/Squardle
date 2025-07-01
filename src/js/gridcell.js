import { CHARACTER_KEYS } from 'constants';

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
    #correct;
    #inWord;
    #inHorizontalWord;
    #inVerticalWord;

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

        this.#correct = false;
        this.#inWord = false;
        this.#inHorizontalWord = false;
        this.#inVerticalWord = false;

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

    get correct() {
        return this.#correct;
    }

    set correct( is_correct ) {
        if (this.correct) return;

        is_correct = Boolean( is_correct )

        this.#inHorizontalWord = this.#inVerticalWord = this.#inWord = is_correct;

        this.#correct = is_correct;
    }

    get disabled() {
        return this.#correct;
    }

    get selected() {
        return this === this.grid.currentCell;
    }

    get inWord() {
        return this.#inWord;
    }

    set inWord( is_in_word ) {
        if (this.correct) return;

        this.#inWord = Boolean( is_in_word );
    }

    get inHorizontalWord() {
        return this.#inHorizontalWord;
    }

    set inHorizontalWord( is_in_word ) {
        if (this.correct) return;

        this.#inHorizontalWord = this.#inWord = Boolean( is_in_word );
    }

    get inVerticalWord() {
        return this.#inVerticalWord;
    }

    set inVerticalWord( is_in_word ) {
        if (this.correct) return;

        this.#inVerticalWord = this.#inWord = Boolean( is_in_word );
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