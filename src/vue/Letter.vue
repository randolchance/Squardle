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

<style>

.content {
    display: flex;
    flex-direction: column;

    width: calc( 9 * var(--pixel-size-x) );
    height: calc( 9 * var(--pixel-size-y) );

    border-style: solid;
    border-width: var(--pixel-size-y) var(--pixel-size-x) var(--pixel-size-y) var(--pixel-size-x);
    border-color: #222222;
}

.pixel-row {
    display: flex;
    flex-direction: row;
}

.pixel {
    width: var(--pixel-size-x);
    height: var(--pixel-size-y);
}

.cell.selected .pixel.off {
    background-color: var(--selected-color);
}

.cell.selected .pixel.on {
    background-color: transparent;
}

.content.correct .pixel.off {
    background-color: var(--correct-color);
}

.content.correct .pixel.on {
    background-color: transparent;
}

</style>