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
    <div class="guess-row" v-for="letter in letters">
        <Letter :content="letter.content" :hint="letter.hint"/>
    </div> 
</template>