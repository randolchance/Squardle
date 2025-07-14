<script setup>
import { reactive, computed } from 'vue';
import Guess from './Guess.vue';

import { DEFAULT_GRID_SIZE } from '@/js/constants';

const props = defineProps({
    max_guesses: Number,
    selected_word_index: Number
})

const size = DEFAULT_GRID_SIZE

const guessedWords = reactive(new Array(2*size).fill(null).map( _ => new Array() ))

const selectedGuessList = computed(()=>{
    if (props.selected_word_index === null) return []

    return guessedWords[props.selected_word_index]
})

const selectedGuessesOpacity = guess_index => {
    const max_guesses = props.max_guesses
    return (max_guesses - (selectedGuessList.value.length - (guess_index + 1))) / max_guesses
}

const showSelectedGuessList = computed(()=>{
    return selectedGuessList.value.length > 0
})

function guess({ word, hints, callback }) {
    const currentGuessedWords = guessedWords[props.selected_word_index]
    if (props.max_guesses - currentGuessedWords.length <= 0) {
        throw new Error(`No more guesses allowed!`)
    }

    callback({
        remaining_guesses: props.max_guesses - currentGuessedWords.push({ word, hints })
    })
}

defineExpose({
    guess,
})

</script>

<template>
    <div class="guess-lists-container">
        <h2 class="guess-list-header">Guesses</h2>
        <h4 class="guesses-remaining" v-if="selected_word_index !== null">Remaining: {{ max_guesses - selectedGuessList.length }}</h4>
        <Transition name="scale-in">
            <div class="guess-list" v-if="showSelectedGuessList">
                <TransitionGroup name="drop-in">
                    <Guess class="guess-row" v-for="(guess_data, i) in selectedGuessList" :key="i" :data-opacity="selectedGuessesOpacity(i)" :word="guess_data.word" :hints="guess_data.hints"/>
                </TransitionGroup>
            </div>
        </Transition>
    </div>
</template>


<style scoped>

.guess-lists-container {
    display: flex;
    flex-direction: column;
    width: 25vw;
    height: 100vh;
}

.guess-list-header {
    text-align: center;
}

.guesses-remaining {
    text-align: center;
}

.guess-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.guess-row {
    padding-top: var(--pixel-size-x);
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    z-index: 0;
    transition: opacity 0.5s cubic-bezier(1, 0.5, 0.8, 1);
    opacity: attr(data-opacity type(<number>));
}

.scale-in-enter-active {
    transition: all 0.2s ease-out;
}

.scale-in-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.scale-in-enter-from,
.scale-in-leave-to {
    transform: scale(0);
}

.drop-in-enter-active {
    transition: all 0.5s ease-out;
}

.drop-in-leave-active {
    transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.drop-in-enter-from,
.drop-in-leave-to {
    transform: translateY(-100%);
    z-index: 1;
}

</style>