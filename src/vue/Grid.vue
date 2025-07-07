<script setup>
import { ref, computed, reactive, watchEffect } from 'vue'
import Cell from './Cell.vue'

import { emitPromise } from '@/js/emit-promise'

import {
    DEFAULT_GRID_SIZE,
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

    disabled: Boolean,
})

const emit = defineEmits(['guess', 'change-word'])

const size = DEFAULT_GRID_SIZE

function makeCell( i, j ) {
    return {
        i, j,
        content: '_',
        locked: DIRECTIONS.neither,
        selected: false,
        hint: null,
    }
}

function isCellDisabled( cell, direction ) {
    return cell.hint === HINTS.correct || direction & cell.locked
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
    return currentCell.cell ? currentCell.cell.j : null
})

const current_column_index = computed(()=>{
    return currentCell.cell ? currentCell.cell.i : null
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

const word_index = computed(()=>{
    if (!currentCell.cell) return null

    return direction.value === DIRECTIONS.horizontal ?
        current_row_index.value : size + current_column_index.value
})

watchEffect(()=>{
    emit('change-word', word_index.value)
})

const is_solved = computed(()=>{
    for (const row of cells) {
        for (const cell of row) {
            if (cell.hint !== HINTS.correct) return false
        }
    }
    return true
})

function onKeydown( event ) {
    const { key } = event
    console.log(key)
    if (!VALID_KEYS.includes(key)) return

    if (!currentCell.cell) {
        console.warn(`Keydown event is active but no cell is selected!`)
        return
    }

    switch (true) {
        case CHARACTER_KEYS.includes(key):
            writeCell( key )
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
                            selectPreviousCell()
                            break
                    }
                    break
                case 'ArrowRight':
                    switch (direction.value) {
                        case DIRECTIONS.horizontal:
                            selectNextCell()
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
                            selectNextCell()
                            break
                    }
                    break
                case 'ArrowLeft':
                    switch (direction.value) {
                        case DIRECTIONS.horizontal:
                            selectPreviousCell()
                            break
                        case DIRECTIONS.vertical:
                            selectPreviousWord()
                            break
                    }
                    break
                case 'Enter':
                    submit()
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
            if (currentCell.cell.locked & DIRECTIONS.vertical) return

            direction.value = DIRECTIONS.vertical
            break

        case DIRECTIONS.vertical:
            if (currentCell.cell.locked & DIRECTIONS.horizontal) return

            direction.value = DIRECTIONS.horizontal
            break
    }

}

function onClick( i, j ) {
    const cell = cells[j][i]
    if (cell === currentCell.cell) {

        toggleDirection()

    } else {

        selectCell( cell )

    }
}

function selectCell( cell ) {
    if (currentCell.cell) deselectCell()

    const { i, j } = cell
    if (i < 0 || j < 0 || i >= size || j >= size) return

    if (isCellDisabled( cell, direction.value )) return

    currentCell.cell = cell

    cell.selected = true

    if (direction.value & cell.locked) {
        
        toggleDirection()
    
    }
    
}

function deselectCell() {

    currentCell.cell.selected = false

    currentCell.cell = null

}

function writeCell( key ) {
    const cell = currentCell.cell
    if (!cell) return

    cell.content = key
    cell.hint = HINTS.unused

    // This won't submit words that are finished with the last letter correct
    if (cell === getCurrentLastFreeCell() && current_word.value) {

        submit()
    
    } else {

        selectNextCell()

    }
}

function clearCell( cell ) {
    if (!cell) return

    cell.content = '_'
}

function eraseCurrentCell() {
    clearCell( currentCell.cell )

    const step_i = direction.value === DIRECTIONS.horizontal
    const step_j = direction.value === DIRECTIONS.vertical

    let cell = currentCell.cell
    let i = cell.i
    let j = cell.j
    do {
        i -= step_i
        j -= step_j
        cell = getCell( i, j )
    } while (cell && isCellDisabled(cell, direction.value))

    if (cell !== currentCell.cell) selectCell({ i, j })
}

function getCell( i, j ) {
    return cells[j][i] || null
}

function* iterateCells( { i, j }, direction, forwards=true ) {
    if (is_solved.value) return

    const step = forwards ? 1 : -1
    const inLimit = index => {
        return forwards ? index < size : index >= 0
    }

    const is_horizontal = direction === DIRECTIONS.horizontal
    let [inner, outer] = is_horizontal ? [i + step, j] : [j + step, i]

    outer += step * !inLimit(inner)
    inner = (inner + size) % size

    for (; inLimit(outer); outer += step) {
        for (; inLimit(inner); inner += step) {
            const cell = is_horizontal ? getCell( inner, outer ) : getCell( outer, inner )
            if (cell) yield cell
        }
    }

    if (inner == size-1 && outer == size-1 || inner == 0 && outer == 0) {

        direction = direction ^ DIRECTIONS.both

        for (const cell of iterateCells( {i:0, j:0}, direction, forwards )) yield cell

    }
}

function* iterateFreeCells( coords, direction, forwards=true ) {
    for (const cell of iterateCells( coords, direction, forwards )) {
        if (isCellDisabled(cell, direction.value)) continue

        yield cell
    }
}

function getNextFreeCell() {
    if (!currentCell.cell) return getCell( 0, 0 )

    return iterateFreeCells( currentCell.cell, direction.value ).next().value
}

function selectNextCell() {
    const i = current_column_index.value
    const j = current_row_index.value
    const cell = getNextFreeCell()
    switch (true) {
        case direction.value === DIRECTIONS.vertical && i > cell.i:
        case direction.value === DIRECTIONS.horizontal && j > cell.j:
            toggleDirection()
    }

    selectCell( cell )
}

function getPreviousFreeCell() {
    if (!currentCell.cell) return getCell( 0, 0 )

    const cell = currentCell.cell
    return iterateFreeCells( cell, direction.value, false ).next()
}

function selectPreviousCell() {
    const i = current_column_index.value
    const j = current_row_index.value
    const cell = getNextFreeCell()
    switch (true) {
        case direction.value === DIRECTIONS.vertical && i < cell.i:
        case direction.value === DIRECTIONS.horizontal && j < cell.j:
            toggleDirection()
    }

    selectCell( cell )
}

function* getCurrentRow() {
    if (!currentCell.cell) return

    const j = current_row_index.value
    for (let i = 0; i < size; i++) {
        yield cells[j][i]
    }
}

function* getCurrentColumn() {
    if (!currentCell.cell) return

    const i = current_column_index.value
    for (let j = 0; j < size; j++) {
        yield cells[j][i]
    }
}

function* getCurrentWordCells() {
    const target = direction.value === DIRECTIONS.horizontal
        ? getCurrentRow()
        : getCurrentColumn()

    for (const cell of target) yield cell
}

function getFirstCell({ i, j }) {
    switch (direction.value) {
        case DIRECTIONS.horizontal:
            return cells[j][0]
        case DIRECTIONS.vertical:
            return cells[0][i]
    }
}

function getCurrentFirstCell() {
    if (!currentCell.cell) return null
    
    return getFirstCell( currentCell.cell )
}

function getCurrentFirstFreeCell() {
    for (const cell of getCurrentWordCells()) {
        if (!isCellDisabled( cell, direction.value )) {
            return cell
        }
    }
}

function selectCurrentFirstFreeCell() {
    const cell = getCurrentFirstFreeCell()
    if (!cell) return

    selectCell( cell )
}

function getLastCell({ i, j }) {
    switch (direction.value) {
        case DIRECTIONS.horizontal:
            return cells[j][size-1]
        case DIRECTIONS.vertical:
            return cells[size-1][i]
    }
}

function getCurrentLastCell() {
    if (!currentCell.cell) return null
    
    return getLastCell( currentCell.cell )
}

function getCurrentLastFreeCell() {
    for (const cell of [...getCurrentWordCells()].reverse()) {
        if (cell.hint !== HINTS.correct && !(cell.locked & direction.value)) {
            return cell
        }
    }
}

function selectCurrentLastFreeCell() {
    const cell = getCurrentLastFreeCell()
    if (!cell) return

    selectCell( cell.i, cell.j )
}

function selectNextWord() {
    const cell = iterateFreeCells( getCurrentLastCell(), direction.value ).next().value
    selectCell( cell )
}

function selectPreviousWord() {
    const previous_cell = iterateFreeCells( getCurrentFirstCell(), direction.value, false ).next().value
    const cell = getFirstCell( previous_cell )
    selectCell( cell )
}

function lockWord() {

    for (const cell of getCurrentWordCells()) cell.lock( direction.value ^ DIRECTIONS.both )

}

async function submit() {
    if (!current_word.value) {

        incompleteWord()

        return
    }

    is_submitting.value = true

    const guessed_word = current_word.value
    const selected_word_index = word_index.value

    const params = new URLSearchParams({
        p: props.puzzle_number,
        i: selected_word_index,
        word: guessed_word,
        m: props.mode,
    })

    let hints
    try {

        const response = await fetch(`http://127.0.0.1:8000/guess?${params}`)

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        hints = await response.json()

    } catch (e) {

        console.error(e.message)

        // Do something with the error and pass it to error

        error()
        
        is_submitting.value = false

        return
    }

    if (!hints) {

        invalidWord()

        selectCurrentFirstFreeCell()

        is_submitting.value = false

        return
    }

    parseHints( hints )

    const is_correct = hints.every( hint => hint === HINTS.correct )

    const guess_data = { word: current_word.value, hints }
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

    is_submitting.value = false
    
}

function error() {

}

function incompleteWord() {

}

function invalidWord() {

}

function parseHints( hints ) {
    for (const [cell, h] of [...getCurrentWordCells()].map( (cell, h) => [cell, h] )) {

        cell.hint = hints[h]
    }
}

const classes = computed(()=>{
    const is_horizontal = direction.value === DIRECTIONS.horizontal
    const currentFirstCell = getCurrentFirstCell()
    const currentLastCell = getCurrentLastCell()
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
    <button class="grid" :disabled="disabled" @keydown.prevent="onKeydown">
        <div class="grid-row" v-for="(row, j) in cells">
            <Cell v-for="(cell, i) in row" :class="classes[j][i]" :cell="cell" @click.prevent="()=>onClick(i,j)"/>
        </div>
    </button>
</template>

<style>

.grid {
    display: flex;
    flex-direction: column;
}

.grid-row {
    display: flex;
    flex-direction: row;
}

</style>