<template>
    <div class="modal-base" v-show="show">
        <div class="modal-base__content">
            <slot></slot>
        </div>

        <div class="modal-base__overlay col-12 h-100" @click="$emit('close')"></div>
    </div>
</template>
  
<script>
export default {
    name: 'ModalDialog',
    props: {
        show: {
            type: String,
            required: true
        }
    },
    watch: {
        show: () => {
            document.body.classList.toggle('overflow-hidden');
        }
    }
}
</script>
  
<style scoped>
.modal-base {
    position: fixed;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: rgba(31,35,40,0.5);
    top: 0;
    left: 0;
}
</style>