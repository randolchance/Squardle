<script setup>

import Cell from "./Cell.vue"

const props = defineProps({
  grid: Object,
})

</script>

<template>
    <div class="grid" :disabled="grid.disabled" @keydown.prevent="grid.onKeydown">
        <div class="grid-row" v-for="j in grid.size">
            <Cell v-for="i in grid.size" :data-i="i-1" :data-j="j-1" :cell="grid.cells[j-1][i-1]"/>
        </div>
    </div>
</template>