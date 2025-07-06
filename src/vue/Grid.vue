<script setup>
import { ref, computed, reactive } from 'vue'
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


function getCurrentRowIndex() {
    return currentCell.cell ? currentCell.cell.j : null
}

function getCurrentColumnIndex() {
    return currentCell.cell ? currentCell.cell.i : null
}

function* getCurrentRow() {
    if (!currentCell.cell) return

    const currentRowIndex = getCurrentRowIndex()
    for (let i = 0; i < size; i++) {
        yield cells[currentRowIndex][i]
    }
}

function* getCurrentColumn() {
    if (!currentCell.cell) return

    const currentColumnIndex = getCurrentColumnIndex()
    for (let j = 0; j < size; j++) {
        yield cells[j][currentColumnIndex]
    }
}

function* getCurrentWordCells() {
    const target = direction.value === DIRECTIONS.horizontal
        ? getCurrentRow()
        : getCurrentColumn()

    for (const cell of target) yield cell
}

const current_word = computed(()=>{
    let word = ''
    for (const cell of getCurrentWordCells()) {
        const content = cell.content
        if (content == '_') return null

        word += content
    }

    return word
})

const word_index = computed(()=>{
    if (!currentCell.cell) return null

    return direction.value === DIRECTIONS.horizontal ?
        getCurrentRowIndex() : size + getCurrentColumnIndex()
})

const is_solved = computed(()=>{
    for (const row of cells) {
        for (const cell of row) {
            if (cell.hint !== HINTS.correct) return false
        }
    }
    return true
})

function getCurrentFirstCell() {
    if (!currentCell.cell) return null
    
    const { i, j } = currentCell.cell
    switch (direction.value) {
        case DIRECTIONS.horizontal:
            return cells[j][0]
        case DIRECTIONS.vertical:
            return cells[0][i]
    }
}

function getCurrentFirstFreeCell() {
    for (const cell of getCurrentWordCells()) {
        if (cell !== HINTS.correct && !(cell.locked & direction.value)) {
            return cell
        }
    }
}

function selectCurrentFirstFreeCell() {
    const cell = getCurrentFirstFreeCell()
    if (!cell) return

    selectCell( cell.i, cell.j )
}

function getCurrentLastCell() {
    if (!currentCell.cell) return null
    
    const { i, j } = currentCell.cell
    switch (direction.value) {
        case DIRECTIONS.horizontal:
            return cells[j][size-1]
        case DIRECTIONS.vertical:
            return cells[size-1][i]
    }
}

function getCurrentLastFreeCell() {
    for (const cell of [...getCurrentWordCells()].reverse()) {
        if (cell.hint !== HINTS.correct && !(cell.locked & direction.value)) {
            return cell
        }
    }
}

function selectCurrentFirstFreeCell() {
    const cell = getCurrentLastFreeCell()
    if (!cell) return

    selectCell( cell.i, cell.j )
}

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
                            previousWord()
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
                            nextWord()
                            break
                    }
                    break
                case 'ArrowDown':
                    switch (direction.value) {
                        case DIRECTIONS.horizontal:
                            nextWord()
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
                            previousWord()
                            break
                    }
                    break
                case 'Enter':
                    submit()
                    break
                case 'Backspace':
                    clearCell()
                    selectPreviousCell()
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

    emit('change-word', word_index.value)

}

function onClick( i, j ) {
    const cell = cells[j][i]
    if (cell === currentCell.cell) {

        toggleDirection()

    } else {

        selectCell( i, j )

    }
}

function selectCell( i, j ) {
    
    if (currentCell.cell) deselectCell()

    if (i < 0 || j < 0 || i >= size || j >= size) return

    const cell = cells[j][i]
    if (cell.hint === HINTS.correct || cell.locked === DIRECTIONS.both) return

    currentCell.cell = cell

    cell.selected = true

    if (direction.value & cell.locked) {
        
        toggleDirection()
    
    } else {

        emit('change-word', word_index.value)

    }
    
}

function deselectCell() {

    currentCell.cell.selected = false

    currentCell.cell = null

}

function selectCurrentFirstCell() {
    const { i, j } = getCurrentFirstCell()

    selectCell( i, j )
}

function selectCurrentLastCell() {
    const { i, j } = getCurrentLastCell()

    selectCell( i, j )
}

function writeCell( key ) {
    const cell = currentCell.cell
    if (!cell) return

    cell.content = key

    if (cell === getCurrentLastCell() && current_word.value) {

        submit()
    
    } else {

        selectNextCell()

    }
}

function clearCell() {
    const cell = currentCell.cell
    if (!cell) return

    cell.content = '_'

    if (cell !== getCurrentFirstCell()) {

        selectPreviousCell()

    }
}

function nextCell() {
    if (!currentCell.cell) return null

    let j = getCurrentRowIndex()
    let i = getCurrentColumnIndex()
    switch (direction.value) {
        case DIRECTIONS.horizontal:
            for (i += 1; i < size; i++) {
                const cell = cells[j][i]
                if (cell.hint !== HINTS.correct && !cell.locked) break
            }
            break

        case DIRECTIONS.vertical:
            for (j += 1; j < size; j++) {
                const cell = cells[j][i]
                if (cell.hint !== HINTS.correct && !cell.locked) break
            }
            break
    }

    return cells[j][i]
}

function selectNextCell() {
    const cell = nextCell()
    if (!cell) return
    
    selectCell( cell.i, cell.j )

    if (!currentCell.cell) nextWord()
}

function previousCell() {
    if (!currentCell.cell) return

    let j = getCurrentRowIndex()
    let i = getCurrentColumnIndex()
    switch (direction.value) {
        case DIRECTIONS.horizontal:
            for (i -= 1; i >= 0; i--) {
                const cell = cells[j][i]
                if (cell.hint !== HINTS.correct && !cell.locked) break
            }
            break

        case DIRECTIONS.vertical:
            for (j -= 1; j >= 0; j--) {
                const cell = cells[j][i]
                if (cell.hint !== HINTS.correct && !cell.locked) break
            }
            break
    }
    
    selectCell( i, j )

    if (!currentCell.cell) previousWord()

}

function selectPreviousCell() {
    const cell = previousCell()
    if (!cell) return
    
    selectCell( cell.i, cell.j )

    if (!currentCell.cell) previousWord()
}

function nextWord() {
    if (!currentCell.cell || is_solved) return

    switch (direction.value) {
        case DIRECTIONS.horizontal:

            let j = getCurrentRowIndex() + 1
            do {

                selectCell( 0, j++ )

            } while (!currentCell.cell && j < size)

            break

        case DIRECTIONS.vertical:

            let i = getCurrentColumnIndex() + 1
            do {

                selectCell( 0, i++ )

            } while (!currentCell.cell && i < size)

            break
    }

    if (!currentCell.cell) {

        toggleDirection()

    }

}

function previousWord() {
    if (!currentCell.cell || is_solved) return
    
    switch (direction.value) {
        case DIRECTIONS.horizontal:

            let j = getCurrentRowIndex() - 1
            do {

                selectCell( 0, j-- )

            } while (!currentCell.cell && j >= 0)

            break

        case DIRECTIONS.vertical:

            let i = getCurrentColumnIndex() - 1
            do {

                selectCell( i--, 0 )

            } while (!currentCell.cell && i >= 0)

            break
    }

    if (!currentCell.cell) {

        toggleDirection()

    }

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

        const response = await fetch(`/guess?${params}`)

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        hints = await response.json()

    } catch (e) {

        console.error(e.message)

        // Do something with the error and pass it to error

        error()

        return
    }

    if (!hints) {

        invalidWord()

        selectCurrentFirstCell()

        return
    }

    parseHints( hints )

    const is_correct = hints.every( hint => hint === HINTS.correct )

    const guess_data = { word: current_word.value, hints }
    const { remaining_guesses } = await emitPromise( emit, 'guess', guess_data )

    if (remaining_guesses == 0) {

        lockWord()

        nextWord()
    
    } else if (is_correct) {
        
        nextWord()
    
    } else {

        selectCurrentFirstCell()

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
    for (const [cell, h] of [...getCurrentWordCells()].map( (cell, h) => [cell, h] )) {

        cell.hint = hints[h]
    }
}

const classes = computed(()=>{
    const is_horizontal = direction.value === DIRECTIONS.horizontal
    const currentFirstCell = getCurrentFirstCell()
    const currentLastCell = getCurrentLastCell()
    const currentRowIndex = getCurrentRowIndex()
    const currentColumnIndex = getCurrentColumnIndex()
    return cells.map((row)=>{
        return row.map((cell)=>{
            const { selected, i, j } = cell
            const row_selected = is_horizontal && j === currentRowIndex
            const row_selected_start = is_horizontal && cell === currentFirstCell
            const row_selected_end = is_horizontal && cell === currentLastCell
            const row_selected_middle = is_horizontal && row_selected && !row_selected_start && !row_selected_end
            const column_selected = !is_horizontal && i === currentColumnIndex
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
    <button class="grid" @keydown.prevent="onKeydown">
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