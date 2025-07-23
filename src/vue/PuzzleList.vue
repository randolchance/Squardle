<script setup>
import { ref, onBeforeMount, reactive } from 'vue';

import Letter from './Letter.vue';

import { HINTS } from '@/js/constants';

import {
    ALL_SINGLE_CHARACTERS,
    generate_numbers_by_digits,
    get_largest_content
} from "@/js/letter-dimensions"

const props = defineProps({
    size: {
        type: Number,
        required: true,
    }
})

const puzzle_count = ref(0)

const largest_content = reactive({size: {w: 0, h: 0}, content: null})

const columns = 9

const rows = ref(0)

onBeforeMount(async () => {
    try {
        const response = await fetch(`http://localhost:8000/list/${props.size}`)

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }

        const number_of_puzzles = await response.json()
        puzzle_count.value = number_of_puzzles

        rows.value = Math.ceil(number_of_puzzles / columns)
        
        Object.assign(largest_content, get_largest_content(
            "PublicPixel",
            64,
            ALL_SINGLE_CHARACTERS.concat(
                generate_numbers_by_digits(puzzle_count.value.toString().length)
            )
        ))
        
    } catch (e) {

        console.error(e)

    }
})

</script>

<template>
    <div class="puzzle-list-container">
        <div class="puzzle-list" v-if="puzzle_count > 0">
            <TransitionGroup name="bounce-in">
                <div class="puzzle-list-row" v-for="j in rows">
                    <div class="puzzle-list-cell" v-for="i in columns">
                        <Letter class="puzzle-list-letter" :content="(i-1) + rows*(j-1) + 1" :hint="HINTS.unused"/>
                    </div>
                </div>
            </TransitionGroup>
        </div>
    </div>
</template>


<style scoped>

.puzzle-list-container {
    display: flex;
    width: 25vw;
    height: 100%;
}

.puzzle-list-letter {
}

.puzzle-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    --scale: 0.3333;
}

.puzzle-list-row {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.puzzle-list-cell {
    --scaled-pixel-size: calc(var(--scale) * var(--pixel-size));
    --scaled-pixel-size-x: var(--scaled-pixel-size);
    --scaled-pixel-size-y: var(--scaled-pixel-size);
    display: flex;
    justify-content: center;
    padding: var(--scaled-pixel-size-y) var(--scaled-pixel-size-x) var(--scaled-pixel-size-y) var(--scaled-pixel-size-x);
}

</style>