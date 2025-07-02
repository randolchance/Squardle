<script setup>

import Grid from "./Grid.vue"
import Guesses from "./Guesses.vue"

import GameGrid from "./game-grid"
import GuessLists from "./guess-lists"


const grid = new GameGrid(1)
const guessLists = new GuessLists(6)



</script>

<template>
    <div class="guess-lists-container">
        <Guesses :guessLists="guessLists"/>
    </div>
    <div class="grid-container">
        <Grid :grid="grid"/>
    </div>
</template>