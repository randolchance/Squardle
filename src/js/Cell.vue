<script setup>

const props = defineProps({
    cell: Object,
})

</script>


<template>
  <div class="cell" :class="cell.selected" :disabled="cell.disabled" @click="cell.onClick">
    <h1 class="cell-content">{{ cell.content }}</h1>
  </div>
</template>