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
    <div class="letter" :class="status">
        <div class="pixel-row" v-for="(row, j) in LETTERS[props.content]" :data-j="j" >
            <div class="pixel" v-for="(pixel, i) in row" :data-i="i" :class="pixel != ' ' ? 'on' : 'off'" ></div>
        </div>
    </div>
</template>

<style scoped>

.letter {

    --cell-pixel-size: calc(var(--scale) * var(--pixel-size));
    --cell-pixel-size-x: var(--cell-pixel-size);
    --cell-pixel-size-y: var(--cell-pixel-size);

    display: flex;
    flex-direction: column;

    width: calc( 7 * var(--cell-pixel-size-x) );
    height: calc( 7 * var(--cell-pixel-size-y) );

    border-style: solid;
    border-width: var(--cell-pixel-size-y) var(--cell-pixel-size-x) var(--cell-pixel-size-y) var(--cell-pixel-size-x);
    border-color: #222222;
}

.letter.correct {
    border-color: var(--correct-color);
}

.letter.in-word {
    border-color: var(--in-word-color);
}

.letter.in-word-horizontal {
    border-color: var(--in-word-horizontal-color);
}

.letter.in-word-vertical {
    border-color: var(--in-word-vertical-color);
}

.letter.in-word-both {
    border-color: var(--in-word-both-color);
}

.selected .letter {
    border-color: var(--selected-color);
    background-color: var(--selected-color);
}

.pixel-row {
    display: flex;
    flex-direction: row;
}

.pixel {
    width: var(--cell-pixel-size-x);
    height: var(--cell-pixel-size-y);
}

.pixel.off {
    background-color: transparent;
}

.pixel.on {
    background-color: var(--selected-color);
}

.selected .pixel.on {
    background-color: black;
}

.letter.correct .pixel.off {
    background-color: var(--correct-color);
}

.letter.in-word .pixel.off {
    background-color: var(--in-word-color);
}

.letter.in-word-horizontal .pixel.off {
    background-color: var(--in-word-horizontal-color);
}

.letter.in-word-vertical .pixel.off {
    background-color: var(--in-word-vertical-color);
}

.letter.in-word-both .pixel.off {
    background-color: var(--in-word-both-color);
}

.selected .pixel.off {
    background-color: var(--selected-color);
}

.letter.correct .pixel.on,
.letter.in-word .pixel.on,
.letter.in-word-horizontal .pixel.on,
.letter.in-word-vertical .pixel.on,
.letter.in-word-both .pixel.on {
    background-color: black;
}

</style>