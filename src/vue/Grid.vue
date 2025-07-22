<script setup>
import { ref, computed, reactive, watch } from 'vue'
import Cell from './Cell.vue'

import { emitPromise } from '@/js/emit-promise'

import {
    CHARACTER_KEYS,
    NON_CHARACTER_KEYS,
    VALID_KEYS,
    DIRECTIONS,
    HINTS,
    MODES,
} from '../js/constants'

const props = defineProps({
    puzzle_number: Number,
    mode: Number,
    size: Number,
    disabled: Boolean,
})

const emit = defineEmits(['guess', 'change-word'])

const size = props.size

const word_index = ref(null)

function makeCell( i, j ) {
    return {
        i, j,
        content: '_',
        locked: DIRECTIONS.neither,
        selected: false,
        hints: [],
    }
}

function isCellDisabled( cell, direction ) {
    return cell.hints[0] === HINTS.correct || direction & cell.locked
}

const cells = reactive((()=>{
    const cells = []
    for (let j = 0; j < size; j++) {
        const row = []
        for (let i = 0; i < size; i++) {
            row.push( makeCell( i, j ) )
        }
        cells.push( row )
    }
    return cells
})())

const direction = ref(DIRECTIONS.horizontal)

const currentCell = reactive({ cell: null })

const current_row_index = computed(()=>{
    const index = word_index.value
    return index && index < size ? index : null
})

const current_column_index = computed(()=>{
    const index = word_index.value
    return index && index >= size ? index % size : null
})

const current_word = computed(()=>{
    let word = ''
    for (const cell of getCurrentWordCells()) {
        const content = cell.content
        if (content == '_') return null

        word += content
    }

    return word
})

const is_submitting = ref(false)

const disabled = computed(()=>{
    return is_submitting.value
})

watch(word_index, ()=>{
    emit('change-word', word_index.value)
})

const is_solved = computed(()=>{
    for (const row of cells) {
        for (const cell of row) {
            if (cell.hints[0] !== HINTS.correct) return false
        }
    }
    return true
})

async function onKeydown( event ) {
    const { key } = event
    console.log(key)
    if (!VALID_KEYS.includes(key)) return
    else if (disabled.value) return

    if (!currentCell.cell) {
        console.warn(`Keydown event is active but no cell is selected!`)
        return
    }

    switch (true) {
        case CHARACTER_KEYS.includes(key):
            await writeCell( key )
            break
        case NON_CHARACTER_KEYS.includes(key):
            switch (key) {
                case 'Tab':
                    toggleDirection()
                    break
                case 'Escape':
                    deselectCell()
                    break
                case 'ArrowUp':
                    switch (direction.value) {
                        case DIRECTIONS.horizontal:
                            selectPreviousWord()
                            break
                        case DIRECTIONS.vertical:
                            selectPreviousFreeCell()
                            break
                    }
                    break
                case 'ArrowRight':
                    switch (direction.value) {
                        case DIRECTIONS.horizontal:
                            selectNextFreeCell()
                            break
                        case DIRECTIONS.vertical:
                            selectNextWord()
                            break
                    }
                    break
                case 'ArrowDown':
                    switch (direction.value) {
                        case DIRECTIONS.horizontal:
                            selectNextWord()
                            break
                        case DIRECTIONS.vertical:
                            selectNextFreeCell()
                            break
                    }
                    break
                case 'ArrowLeft':
                    switch (direction.value) {
                        case DIRECTIONS.horizontal:
                            selectPreviousFreeCell()
                            break
                        case DIRECTIONS.vertical:
                            selectPreviousWord()
                            break
                    }
                    break
                case 'Enter':
                    await submit()
                    break
                case 'Backspace':
                    eraseCurrentCell()
                    break
                
            }
            break
    }
}

function toggleDirection() {
    switch (direction.value) {
        case DIRECTIONS.horizontal:
            direction.value = DIRECTIONS.vertical
            break

        case DIRECTIONS.vertical:
            direction.value = DIRECTIONS.horizontal
            break
    }
}

function onClick({ i, j }) {
    if (disabled.value) return

    const cell = cells[j][i]
    if (cell === currentCell.cell) {

        toggleDirection()

    } else {

        selectCell( cell )

    }

    selectWord( cell )
}

function selectWord({ i, j }) {
    if (i < 0 || j < 0 || i >= size || j >= size) {

        deselectWord()

        return
    }

    switch (direction.value) {
        case DIRECTIONS.horizontal:
            word_index.value = j
            break

        case DIRECTIONS.vertical:
            word_index.value = size + i
            break
    }
}

function selectNextWord() {

    word_index.value = (word_index.value + 1) % (2 * size)

}

function selectPreviousWord() {

    word_index.value = (word_index.value - 1) % (2 * size)

}

function deselectWord() {

    word_index.value = null

}

function selectCell( cell ) {
    if (currentCell.cell) deselectCell()

    if (!cell) return

    const { i, j } = cell
    if (i < 0 || j < 0 || i >= size || j >= size) return

    if (isCellDisabled( cell, direction.value )) return

    currentCell.cell = cell

    cell.selected = true
    
}

function deselectCell() {

    currentCell.cell.selected = false

    currentCell.cell = null

}

function writeCell( key ) {
    const cell = currentCell.cell
    if (!cell) return

    cell.content = key
    
    updateHint( cell, HINTS.unused )

    if (cell === getCurrentLastFreeCell()) {

        deselectCell()
    
    }
}

function updateHint( cell, hint ) {
    cell.hints[1] = cell.hints[0]
    cell.hints[0] = hint
}

function clearCell( cell ) {
    if (!cell) return

    cell.content = '_'
}

// This is broken!
function eraseCurrentCell() {
    if (!isCellDisabled(cell, direction.value) && currentCell.cell.content !== '_') {

        clearCell( currentCell.cell )

        return
    }
    
    const cell = currentCell.cell

    selectPreviousFreeCell()

    if (cell !== currentCell.cell) {

        clearCell( cell )

        selectCell( cell )

    }
}

function getCell( i, j ) {
    return cells[j][i] || null
}

function* getRow({ j }) {
    for (let i = 0; i < size; i++) yield cells[j][i]
}

function* getCurrentRow() {
    const j = current_row_index.value
    if (!j) return

    for (const cell of getRow({ j })) yield cell
}

function* getColumn({ i }) {
    for (let j = 0; j < size; j++) yield cells[j][i]
}

function* getCurrentColumn() {
    const i = current_column_index.value
    if (!i) return

    for (const cell of getColumn({ i })) yield cell
}

function* getCurrentWordCells() {
    let word_cells
    switch (direction.value) {
        case DIRECTIONS.horizontal:
            word_cells = getCurrentRow()
            break
        case DIRECTIONS.vertical:
            word_cells = getCurrentColumn()
            break
    }

    for (const cell of word_cells) yield cell
}

function* getCurrentPossibleCells() {
    yield* getCurrentWordCells().filter( cell => !isCellDisabled( cell, direction.value ) )
}

function getCurrentFirstFreeCell() {
    return getCurrentPossibleCells().next().value || null
}

function selectCurrentFirstFreeCell() {
    selectCell( getCurrentFirstFreeCell() )
}

function getCurrentLastFreeCell() {
    return [...getCurrentPossibleCells()].reverse()[0] || null
}

function selectCurrentLastFreeCell() {
    selectCell( getCurrentLastFreeCell() )
}

function selectNextFreeCell() {
    // If the puzzle is solved then deselect everything
    if (is_solved.value) {

        deselectWord()

        deselectCell()

        return
    }

    // If no word is selected then there is no next cell to select
    if (word_index.value === null) return null

    // If no cell is selected (but a word is) then select first free cell
    if (!currentCell.cell) {

        selectCurrentFirstFreeCell()

        return
    }

    // Get a list of all possible cells in the currently selected word
    const possibleCells = [...getCurrentPossibleCells()]

    // Get the index of the currently selected cell
    const current_index = possibleCells.findIndex( cell => cell === currentCell.cell )

    // Choose the next possible free cell in the word
    const cell = possibleCells[ current_index + 1 ]
    if (cell) {

        selectCell( cell )

        return
    }
    
    // If there are no more free cells in the word, select the next word and repeat
    selectNextWord()

    selectNextFreeCell()
}

function selectPreviousFreeCell() {
    // If the puzzle is solved then deselect everything
    if (is_solved.value) {

        deselectWord()

        deselectCell()

        return
    }

    // If no word is selected then there is no next cell to select
    if (word_index.value === null) return null

    // If no cell is selected (but a word is) then select first free cell
    if (!currentCell.cell) {

        selectCurrentLastFreeCell()

        return
    }

    // Get a list of all possible cells in the currently selected word
    const possibleCells = [...getCurrentPossibleCells()].reverse()

    // Get the index of the currently selected cell
    const current_index = possibleCells.findIndex( cell => cell === currentCell.cell )

    // Choose the previous possible free cell in the word
    const cell = possibleCells[ current_index - 1 ]
    if (cell) {

        selectCell( cell )

        return
    }
    
    // If there are no more free cells in the word, select the previous word and repeat
    selectPreviousWord()

    selectPreviousFreeCell()
}


function lockWord() {

    for (const cell of getCurrentWordCells()) cell.locked = cell.locked | direction.value 

}

async function submit() {
    const word = current_word.value
    if (!word) {

        incompleteWord()

        return
    }

    const params = {
        word,
        word_index: word_index.value,
    }

    const request = new Request(`http://localhost:8000/p/guess`,{
        method: "POST",
        body: JSON.stringify(params),
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Origin": "*",
        },
        credentials: 'include',
    })

    let hints
    try {

        is_submitting.value = true

        const response = await fetch(request)

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        hints = await response.json()

    } catch (e) {

        console.error(e.message)

        // Do something with the error and pass it to error maybe

        error()

        return
    } finally {
        
        is_submitting.value = false

    }

    if (!hints) {

        invalidWord()

        selectCurrentFirstFreeCell()

        return
    }

    parseHints( hints )

    const is_correct = hints.every( hint => hint === HINTS.correct )

    const guess_data = { word, hints }
    const { remaining_guesses } = await emitPromise( emit, 'guess', guess_data )

    if (remaining_guesses == 0) {

        lockWord()

        selectNextWord()
    
    } else if (is_correct) {
        
        selectNextWord()
    
    } else {

        selectCurrentFirstFreeCell()

    }

    if (!currentCell.cell) {

        // Win condition because there are no words left to select

    }
    
}

function error() {

}

function incompleteWord() {

}

function invalidWord() {

}

function parseHints( hints ) {
    for (const [cell, i] of getCurrentWordCells().map( (cell, i) => [cell, i] )) {

        updateHint( cell, hints[i] )
        
    }
}


function getFirstCellInWord( index ) {
    
    const i = index >= size ? index % size : 0
    const j = index < size ? index : 0

    return cells[j][i]
}

function getLastCellInWord( index ) {
    
    const i = index >= size ? index % size : 0
    const j = index < size ? index : 0

    return cells[j][i]
}

// TO DO: Review or rework with new functions
const classes = computed(()=>{
    const is_horizontal = direction.value === DIRECTIONS.horizontal
    const currentFirstCell = getFirstCellInWord( word_index )
    const currentLastCell = getLastCellInWord( word_index )
    return cells.map((row)=>{
        return row.map((cell)=>{
            const { selected, i, j } = cell
            const row_selected = is_horizontal && j === current_row_index.value
            const row_selected_start = is_horizontal && cell === currentFirstCell
            const row_selected_end = is_horizontal && cell === currentLastCell
            const row_selected_middle = is_horizontal && row_selected && !row_selected_start && !row_selected_end
            const column_selected = !is_horizontal && i === current_column_index.value
            const column_selected_start = !is_horizontal && cell === currentFirstCell
            const column_selected_end = !is_horizontal && cell === currentLastCell
            const column_selected_middle = !is_horizontal && column_selected && !column_selected_start && !column_selected_end
            return {
                'selected': selected,
                'row-selected': row_selected,
                'row-selected-start': row_selected_start,
                'row-selected-middle': row_selected_middle,
                'row-selected-end': row_selected_end,
                'column-selected': column_selected,
                'column-selected-start': column_selected_start,
                'column-selected-middle': column_selected_middle,
                'column-selected-end': column_selected_end,
            }
        })
    })
})

</script>

<template>
    <div class="grid-container">
        <button ref="grid" tabindex="0" class="grid" @keydown.prevent="onKeydown">
            <div class="grid-row" v-for="(row, j) in cells">
                <Cell v-for="(cell, i) in row" :class="classes[j][i]" :cell="cell" @click.prevent="()=>onClick(cell)"/>
            </div>
        </button>
    </div>
</template>

<style>

.grid-container {
    display: flex;
    width: 50vw;
    height: 100%;
    margin: auto;
}

.grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.grid-row {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

</style>