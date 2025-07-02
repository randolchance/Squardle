<script setup>
import { computed } from 'vue';
import Letter from './Letter.vue';

import { DIRECTIONS } from './constants';


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
        'cell-selected': selected,
        'row-selected': row_selected,
        'row-selected-start': row_selected_start,
        'row-selected-end': row_selected_end,
        'column-selected': column_selected,
        'column-selected-start': column_selected_start,
        'column-selected-end': column_selected_end,
    }
})

</script>


<template>
    <div class="cell" :class="classes" :disabled="cell.disabled" @click="cell.onClick">
        <Letter :content="cell.content" :hint="cell.hint"/>
    </div>
</template>