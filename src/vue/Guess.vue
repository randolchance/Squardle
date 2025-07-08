<script setup>
import { computed } from 'vue';

import Letter from './Letter.vue';


const props = defineProps({
    word: String,
    hints: Array,
})

const letters = computed(()=>{
    return [...props.word].map( ( content, i ) => {
        const hint = props.hints[i];
        return { content, hint }
    } )
})

</script>


<template>
    <div class="guess-container">
        <Letter class="guess-letter" v-for="letter in letters" :content="letter.content" :hint="letter.hint"/>
    </div>
</template>


<style scoped>

.guess-letter {
    --scale: 0.45;
}

</style>