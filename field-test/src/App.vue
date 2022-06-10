<template>
  <div class="container">
    <h1 class="page-title">Pokemons</h1>

    <PokemonsContainer />
  </div>
</template>

<script>
import PokemonsContainer from "./components/PokemonsContainer.vue";

export default {
  name: "App",

  components: {
    PokemonsContainer,
  },
};
</script>

<style src="./assets/css/app.css" />
