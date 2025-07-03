<script setup>
import Guess from './Guess.vue';


defineProps({
    guessLists: {
        type: Object,
        required: true
    }
})

</script>

<template>
    <div class="guess-list">
        <div v-for="guesses in guessLists.currentList">
            <Guess v-for="guess in guesses" v-bind="guess"/>
        </div>
    </div>
</template>