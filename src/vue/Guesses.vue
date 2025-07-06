<script setup>
import { computed, reactive } from 'vue';
import Guess from './Guess.vue';

import { DEFAULT_GRID_SIZE } from '@/js/constants';

const props = defineProps({
    max_guesses: Number,
    selected_word_index: Number
})

const size = DEFAULT_GRID_SIZE

const guessedWords = new Array(2*size).fill(null).map( _ => new Array() )

const selectedGuessList = computed(()=>{
    if (props.selected_word_index === null) return []

    console.log(guessedWords[props.selected_word_index])

    return guessedWords[props.selected_word_index]
})

function guess({ word, hints, callback }) {
    const currentGuessedWords = guessedWords[props.selected_word_index]
    if (props.max_guesses - currentGuessedWords.length <= 0) {
        throw new Error(`No more guesses allowed!`)
    }

    const current_guess_count = currentGuessedWords.push({ word, hints })

    console.log(current_guess_count)

    callback({
        remaining_guesses: props.max_guesses - current_guess_count
    })
}

defineExpose({
    guess,
})

</script>

<template>
    <div class="guess-list">
        <div v-for="guesses in selectedGuessList">
            <Guess v-for="guess_data in guesses" :word="guess_data.word" :hints="guess_data.hints"/>
        </div>
    </div>
</template>