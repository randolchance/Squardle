<script setup>

import Grid from "./Grid.vue"
import Guesses from "./Guesses.vue"


</script>

<template>
    <div class="squardle">
        <div class="guess-lists-container">
            <Guesses/>
        </div>
        <div class="grid-container">
            <Grid :puzzle_number="1" :mode="0"/>
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