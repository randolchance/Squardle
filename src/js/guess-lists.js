import { DEFAULT_GRID_SIZE, HINTS } from "./constants";


export default class GuessLists {

    #guess_qty;
    #size;
    #horizontal;
    #vertical;

    constructor( guess_qty, size=DEFAULT_GRID_SIZE ) {

        this.#guess_qty = guess_qty;

        this.#size = size;

        this.#horizontal = new Array(size).fill(null).map( _ => new Array(guess_qty).fill('') );
        this.#vertical = new Array(size).fill(null).map( _ => new Array(guess_qty).fill('') );

        this.selected_word_index = null;

    }

    get guess_qty() {
        return this.#guess_qty;
    }

    get size() {
        return this.#size;
    }

    get horizontal() {
        return this.#horizontal;
    }

    get vertical() {
        return this.#vertical;
    }

    guess( word, hints ) {
        const is_horizontal = this.selected_word_index < this.size;
        word_index -= is_horizontal ? 0 : this.size;

        const target = (is_horizontal ? this.#horizontal : this.#vertical)[word_index];
        target.push({ word, hints });
        
        return this.guess_qty - target.length;
    }

}
