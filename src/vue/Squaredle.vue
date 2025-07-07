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
    </div>
</template>

<style>

:root {
    --pixel-size: 14px;

    --pixel-size-x: var(--pixel-size);
    --pixel-size-y: var(--pixel-size);

    --selected-color: white;
    --correct-color: forestgreen;
    --in-word-color: gold;
    --in-word-horizontal-color: gold;
    --in-word-vertical-color: deepskyblue;
    --in-word-both-color: darkviolet;

    --selected-border-style: solid;

}

body {
    margin: 0;
    background-color: #111111;
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

.guess-lists-container {
    display: flex;
    width: 25vw;
    height: 100vh;
}

.grid-container {
    display: flex;
    width: 50vw;
    height: 100%;
    margin: auto;
}

.puzzle-list-container {
    display: flex;
    width: 25vw;
    height: 100%;
}

</style>