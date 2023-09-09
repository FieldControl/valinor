<template>
    <div class="skeleton" :style="{ width: w, height: h }">
        <slot />
    </div>
</template>
  
<script>
export default {
    props: {
        w: {
            type: String,
            default: '100%'
        },
        h: {
            type: String,
            default: 'auto'
        },
        count: {
            type: Number,
            default: 1
        }
    }
};
</script>
  
<style scoped>
.skeleton {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: flex-start;
}
</style>
  