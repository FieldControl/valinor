<template>
    <div class="search-input input-group">
        <div class="input-group-prepend">
            <div class="input-group-text border-0">
                <span class="fa-solid fa-magnifying-glass"></span>
            </div>
        </div>

        <input
            type="text"
            class="form-control text-light font-15 py-0"
            :placeholder="placeholder"
            :value="value"
            ref="search-input"
            @keyup.enter="event => $emit('search', event.target.value)"
            @focus="() => $emit('focus')"
            @input="event => $emit('input', event.target.value)"
        >
    </div>
</template>

<script>
export default {
    name: 'SearchInput',
    props: {
        placeholder: {
            type: String,
            default: 'Search'
        },
        value: {
            type: String,
            default: ''
        },
    },
    methods: {
        emitEvent(event) {
            this.$emit('search', event.target.value)
        }
    }
}
</script>

<style scoped>
.search-input .input-group-prepend {
    position: absolute;
    left: 0;
    top: 4px;
}

.search-input input {
    padding-left: 38px;
    border-color: #57606a;
    border-radius: 5px !important;
}

.search-input input,
.search-input .input-group-text {
    background-color: transparent;
}

.search-input .input-group-text {
    padding-left: 10px;
}

.search-input .input-group-text svg {
    color: #57606a;
}
</style>