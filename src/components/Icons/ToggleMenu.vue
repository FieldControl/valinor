<template>
    <button
        class="toggle-menu bg-dark--secundary border-0"
        :class="{ 'active': active }"
        @click="toggle"
    >
        <div class="toggle-menu__content bg-dark--secundary">
            <div class="mt-1"></div>
            <div class="mt-1"></div>
            <div class="mt-1"></div>
        </div>
    </button>
</template>

<script>
export default {
    name: 'ToggleMenu',
    data: () => ({
        active: false
    }),
    methods: {
        toggle() {
            this.active = !this.active;
            this.$emit('toggle', this.active);
            document.body.classList.toggle('overflow-hidden');
        }
    }
}
</script>

<style scoped>
.toggle-menu {
    width: 22px;
}
.toggle-menu__content div {
    height: 2px;
    background: var(--primary-color-light);
}

.toggle-menu .toggle-menu__content div {
    transition: all .4s;
}

.toggle-menu.active .toggle-menu__content div:nth-child(1) {
    transform: rotate(45deg) translateY(4px);
}

.toggle-menu.active .toggle-menu__content div:nth-child(2) {
    transform: rotate(-45deg) translateY(-4px);
}

.toggle-menu.active .toggle-menu__content div:nth-child(3) {
    transform: rotate(-45deg) translateY(-8px) translateX(4px);
}
</style>