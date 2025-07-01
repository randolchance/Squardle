<script setup>

import Cell from "./Cell.vue"

defineProps({
  grid: Object,
})

</script>

<template>
  <div class="grid" :disabled="grid.disabled" @keydown.prevent="grid.onKeydown">
    <div class="grid-row" v-for="j in grid.size">
      <Cell v-for="i in grid.size" :data-i="i" :data-j="j" :cell="grid.cells[j][i]">
        {{ grid.cells[j][i].content }}
      </Cell>
    </div>
  </div>
</template>