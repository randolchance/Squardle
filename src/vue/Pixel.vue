<script setup>
import { computed, useTemplateRef } from 'vue';

const pixel = useTemplateRef("pixel")

const props = defineProps({
    i: {
        type: Number,
        required: true,
    },
    j: {
        type: Number,
        required: true,
    },
})

const positioning = computed(()=>{
    if (!pixel.value) return {}
    
    const { width, height } = pixel.value.getBoundingClientRect()
    return {
        left: `${-width * props.i}px`,
        top: `${-height * props.j}px`,
    }
})

</script>

<template>
    <div ref="pixel" class="pixel">
        <div class="pixel-content-container" :style="positioning">
            <div class="pixel-content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped>

.pixel {
    display: flex;
    overflow: hidden;

    width: var(--cell-pixel-size-x);
    height: var(--cell-pixel-size-y);
}

.pixel-content-container {
    display: flex;
    flex: 1 0 auto;
    
    position: relative;
    background-color: transparent;

    font-size: calc( 7 * var(--cell-pixel-size-y) * var(--scale));

    width: calc( 7 * var(--cell-pixel-size-x) );
    height: calc( 7 * var(--cell-pixel-size-y) );

    font-family: "PublicPixel";
    /* font-weight: 500; */
    text-transform: capitalize;
}

.pixel-content {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;
}

</style>