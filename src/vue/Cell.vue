<script setup>
import Letter from './Letter.vue';


const { cell } = defineProps({
    cell: {
        type: Object,
        required: true,
    }
})




</script>


<template>
    <div class="cell" :disabled="disabled">
        <Letter :content="cell.content" :hint="cell.hint"/>
    </div>
</template>

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