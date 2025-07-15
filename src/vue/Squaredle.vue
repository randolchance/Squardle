<script setup>

import { ref, useTemplateRef } from "vue"
import Grid from "./Grid.vue"
import Guesses from "./Guesses.vue"
import PuzzleList from "./PuzzleList.vue"

import { DEFAULT_WORD_SIZE } from "@/js/constants"

const guesses = useTemplateRef('guesses')

let selected_word_index = ref(null)


function makeGuess( guess_data ) {
    guesses.value.guess( guess_data )
}

function changeWord( word_index ) {
    selected_word_index.value = word_index
}

</script>

<template>
    <div class="squardle">
        <Guesses ref="guesses" :max_guesses="4" :selected_word_index="selected_word_index"/>
        <Grid :size="DEFAULT_WORD_SIZE" :puzzle_number="1" :mode="0" @guess="makeGuess" @change-word="changeWord"/>
        <PuzzleList :size="DEFAULT_WORD_SIZE"/>
    </div>
</template>

<style>

:root {
    --pixel-size: round(up, 0.73vw, 1px);

    --pixel-size-x: var(--pixel-size);
    --pixel-size-y: var(--pixel-size);

    --selected-color: white;
    --correct-color: forestgreen;
    --in-word-color: rgb(253, 224, 56);
    --in-word-horizontal-color: rgb(253, 224, 56);
    --in-word-vertical-color: deepskyblue;
    --in-word-both-color: rgb(231, 91, 231);

    --selected-border-style: solid;

}

@font-face {
    font-family: "PublicPixel";
    src: url("/src/fonts/PublicPixel.ttf")
}

body {
    margin: 0;
    background-color: #111111;
    color: white;
}

h1, h2, h3, h4 {
    font-family: "PublicPixel";
    text-transform: uppercase;
}

button, button:focus {
    border: none;
    background-color: transparent;
    outline: none;
}

.squardle {
    display: flex;
    flex-direction: row;
}

</style>