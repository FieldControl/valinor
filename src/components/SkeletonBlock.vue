<template>
    <div class="skeleton-block" :style="{ width: w, height: h }"></div>
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
            default: '10px'
        }
    }
}
</script>
  
<style scoped>
.skeleton-block {
    background: var(--secundary-color-background-dark);
    margin-bottom: 10px;
    position: relative;
    overflow: hidden;
}

.skeleton-block:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: linear-gradient(90deg, transparent, var(--primary-color-background-dark), transparent);
    animation: loading 1.3s infinite;
}

@keyframes loading {
    100% {
        left: 100%;
    }
}
</style>
  