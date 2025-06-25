import { CHARACTER_KEYS } from 'constants';

export default class Cell {

    /* Bindables */
    static onClick( event ) {
        event.preventDefault();
        if (!this.enabled) return;
        
        this.grid.clickCell( this );

    }

    /* Private instance properties */
    #i;
    #j;
    #grid;
    #element;
    #enabled;
    #content;
    #correct;
    #inWord;
    #inHorizontalWord;
    #inVerticalWord;

    /* Private instance functions */
    #onClick;

    constructor( i, j, grid ) {
        if (typeof i !== 'number' || typeof j !== 'number') {
            throw new Error(`Index is invalid! Given: ${i}, ${j}`);
        } else if (Math.min(0,i,j) < 0 || Math.max(grid.size,i,j) > grid.size) {
            throw new Error(`Indexes ${i}, ${j} are out of bounds! grid size is ${grid.size}`);
        }

        const element = document.createElement('div');
        element.classList.add('cell');
        element.setAttribute('data-i', i);
        element.setAttribute('data-j', j);

        this.#i = i;
        this.#j = j;

        this.#grid = grid;
        this.#element = element;
        this.#enabled = false;

        this.#content = null;
        this.#correct = false;
        this.#inWord = false;
        this.#inHorizontalWord = false;
        this.#inVerticalWord = false;

        this.#onClick = Cell.onClick.bind(this);

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

    get element() {
        return this.#element;
    }

    get enabled() {
        return this.#enabled;
    }

    set enabled( state ) {
        switch (Boolean(state) && !this.correct) {
            case true:
                this.#element.addEventListener('click', this.#onClick);
                this.#enabled = true;
                break;
            case false:
                this.#element.removeEventListener('click', this.#onClick);
                this.#enabled = false;
                break;
        }
    }

    get content() {
        return this.#content;
    }

    get correct() {
        return this.#correct;
    }

    set correct( is_correct ) {
        if (this.correct) return;

        this.#inWord = Boolean( is_correct );
        this.#correct = Boolean( is_correct );
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