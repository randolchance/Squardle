<script setup>

import { ref, useTemplateRef } from "vue"
import Grid from "./Grid.vue"
import Guesses from "./Guesses.vue"

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
        <div class="guess-lists-container">
            <Guesses ref="guesses" :max_guesses="4" :selected_word_index="selected_word_index"/>
        </div>
        <div class="grid-container">
            <Grid :puzzle_number="1" :mode="0" @guess="makeGuess" @change-word="changeWord"/>
        </div>
        <div class="puzzle-list-container">
            
        </div>
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

.puzzle-list-container {
    display: flex;
    width: 25vw;
    height: 100%;
}

</style>