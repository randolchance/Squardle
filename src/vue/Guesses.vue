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
    <Transition name="left-slide">
        <div class="guess-list" v-if="selectedGuessList.length > 0" >
            <Guess class="guess-row" v-for="guess_data in selectedGuessList" :word="guess_data.word" :hints="guess_data.hints"/>
        </div>
    </Transition>
</template>


<style>

.guess-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.guess-row {
    width: 80%;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.left-slide-enter-active {
  transition: all 0.2s ease-out;
}

.left-slide-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.left-slide-enter-from,
.left-slide-leave-to {
  transform: scale(0);
}

</style>