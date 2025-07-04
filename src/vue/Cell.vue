<script setup>
import { computed } from 'vue';
import Letter from './Letter.vue';

import { DIRECTIONS } from '../js/constants';


const props = defineProps({
    cell: {
        type: Object,
        required: true,
    }
})

const classes = computed(()=>{
    const { cell } = props
    const { grid, selected, i, j } = cell
    const { direction, currentRowIndex, currentColumnIndex, currentFirstCell, currentLastCell } = grid
    const is_horizontal = direction === DIRECTIONS.horizontal
    const row_selected = is_horizontal && j === currentColumnIndex
    const row_selected_start = is_horizontal && cell === currentFirstCell
    const row_selected_end = is_horizontal && cell === currentLastCell
    const column_selected = !is_horizontal && i === currentRowIndex
    const column_selected_start = !is_horizontal && cell === currentFirstCell
    const column_selected_end = !is_horizontal && cell === currentLastCell
    return {
        'selected': selected,
        'row-selected-middle': row_selected,
        'row-selected-start': row_selected_start,
        'row-selected-end': row_selected_end,
        'column-selected-middle': column_selected,
        'column-selected-start': column_selected_start,
        'column-selected-end': column_selected_end,
    }
})

</script>


<template>
    <div class="cell" :class="classes" :disabled="cell.disabled" @click="cell.onClick">
        <Letter :content="cell.content" :hint="cell.hint"/>
    </div>
</template><style>

<style>

.cell {
    width: calc( 9 * var(--pixel-size-x) );
    height: calc( 9 * var(--pixel-size-y) );
    border-color: var(--selected-color);
    border-width: var(--pixel-size-y) var(--pixel-size-x) var(--pixel-size-y) var(--pixel-size-x);
    padding: var(--pixel-size-y) var(--pixel-size-x) var(--pixel-size-y) var(--pixel-size-x);
}

.cell.row-selected-start {
    border-style: var(--selected-border-style) none var(--selected-border-style) var(--selected-border-style);
    padding: 0 var(--pixel-size-x) 0 0;
}

.cell.row-selected-middle {
    border-style: var(--selected-border-style) none var(--selected-border-style) none;
    padding: 0 var(--pixel-size-x) 0 var(--pixel-size-x);
}

.cell.row-selected-end {
    border-style: var(--selected-border-style) var(--selected-border-style) var(--selected-border-style) none;
    padding: 0 0 0 var(--pixel-size-x);
}

.cell.column-selected-start {
    border-style: var(--selected-border-style) var(--selected-border-style) none var(--selected-border-style);
    padding: 0 0 var(--pixel-size-y) 0;
}

.cell.column-selected-middle {
    border-style: none var(--selected-border-style) none var(--selected-border-style);
    padding: var(--pixel-size-y) 0 var(--pixel-size-y) 0;
}

.cell.column-selected-end {
    border-style: none var(--selected-border-style) var(--selected-border-style) var(--selected-border-style);
    padding: var(--pixel-size-y) 0 0 0;
}

</style>