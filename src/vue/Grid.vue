<script setup>

import Cell from "./Cell.vue"

const props = defineProps({
  grid: Object,
})

</script>

<template>
    <button class="grid" @keydown.prevent="onKeydown">
        <div class="grid-row" v-for="(row, j) in cells">
            <Cell v-for="(cell, i) in row" :class="classes[j][i]" :cell="cell" @click.prevent="()=>onClick(i,j)"/>
        </div>
    </button>
</template>

<style scoped>

.grid {
    display: flex;
    flex-direction: column;
}

.grid-row {
    display: flex;
    flex-direction: row;
}

</style>