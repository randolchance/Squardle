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

    get is_horizontal() {
        return this.selected_word_index < this.size;
    }

    get is_vertical() {
        this.selected_word_index >= this.size;
    }

    get currentList() {
        return (this.is_horizontal ? this.#horizontal : this.#vertical)[this.selected_word_index];
    }

    guess( word, hints ) {
        this.currentList.push({ word, hints });
        
        return this.guess_qty - this.currentList.length;
    }

}
