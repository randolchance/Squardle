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
            return 'in-word'
        case HINTS.inWordHorizontal:
            return 'in-word-horizontal'
        case HINTS.inWordVertical:
            return 'in-word-vertical'
        case HINTS.inWordBoth:
            return 'in-word-both'
        default:
            return ''
    }
})


</script>

<template>
    <div class="content" :class="status">
        <div class="pixel-row" v-for="(row, j) in LETTERS[props.content]" :data-j="j" >
            <div class="pixel" v-for="(pixel, i) in row" :data-i="i" :class="pixel != ' ' ? 'on' : 'off'" ></div>
        </div>
    </div>
</template>

<style>

.content {
    display: flex;
    flex-direction: column;

    width: calc( 7 * var(--pixel-size-x) );
    height: calc( 7 * var(--pixel-size-y) );

    border-style: solid;
    border-width: var(--pixel-size-y) var(--pixel-size-x) var(--pixel-size-y) var(--pixel-size-x);
    border-color: #222222;
}

.content.correct {
    border-color: var(--correct-color);
}

.selected .content {
    border-color: var(--selected-color);
    background-color: var(--selected-color);
}

.pixel-row {
    display: flex;
    flex-direction: row;
}

.pixel {
    width: var(--pixel-size-x);
    height: var(--pixel-size-y);
}

.pixel.off {
    background-color: transparent;
}

.pixel.on {
    background-color: var(--selected-color);
}

.selected .pixel.off {
    background-color: var(--selected-color);
}

.selected .pixel.on {
    background-color: black;
}

.content.correct .pixel.off {
    background-color: var(--correct-color);
}

.content.correct .pixel.on {
    background-color: transparent;
}

</style>