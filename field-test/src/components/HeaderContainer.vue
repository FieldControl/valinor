<template>
  <header class="header">
    <div class="container">
      <input
        type="search"
        name="search"
        id="search"
        placeholder="Pesquisar"
        class="search"
        @change="searchPokemon($event.target.value)"
      />
    </div>
  </header>
</template>

<script>
export default {
  name: "HeaderContainer",

  methods: {
    searchPokemon(value) {
      this.$emit("input", value);
    },
  },
};
</script>

<style scoped src="../assets/css/header.css" />