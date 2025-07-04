<script setup>

import Grid from "./Grid.vue"
import Guesses from "./Guesses.vue"

import GameGrid from "../js/game-grid"
import GuessLists from "../js/guess-lists"


const guessLists = new GuessLists(6)
const grid = new GameGrid(guessLists, 1)



</script>

<template>
    <div class="squardle">
        <div class="guess-lists-container">
            <Guesses :guessLists="guessLists"/>
        </div>
        <div class="grid-container">
            <Grid :grid="grid"/>
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

    --selected-border-style: solid;

}

body {
    margin: 0;
    background-color: #111111;
}

.squardle {
    display: flex;
    flex-direction: row;
}

</style>