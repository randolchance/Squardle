<script setup>
import { computed } from 'vue';
import { HINTS } from './constants';

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
    <h1 class="content" :class="status">{{ content }}</h1>
</template>