<script setup>
import { computed } from 'vue'
import { HINTS } from '../js/constants'
import { LETTERS } from '../js/letters'

const props = defineProps({
    content: String,
    hint: Number,
})


const status = computed(() => {
    switch (props.hint) {
        case HINTS.correct:
            return 'correct'
        case HINTS.inWord:
            return 'inWord'
        case HINTS.inWordHorizontal:
            return 'inWordHorizontal'
        case HINTS.inWordVertical:
            return 'inWordVertical'
        default:
            return ''
    }
})


</script>

<template>
    <div class="content" :class="status">
        <div class="pixel-row" v-for="(row, j) in LETTERS[props.content]" :data-j="j-1" >
            <div class="pixel" v-for="(pixel, i) in row" :data-i="i-1" :class="pixel != ' ' ? 'on' : 'off'" ></div>
        </div>
    </div>
</template>

<style scoped>


</style>