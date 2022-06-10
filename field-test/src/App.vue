<template>
  <HeaderContainer />

  <div class="container">
    <h1 class="page-title">Pokemons</h1>

    <PokemonsContainer />

    <!-- <div class="section">
      <div>Resultados por página: {{ perPage }}</div>
      <div class="prev-next">
        <button
          type="button"
          class="button prev-button"
          v-if="prev !== null"
          @click="prevPokemons()"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button
          type="button"
          class="button next-button"
          @click="nextPokemons()"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <div class="pokemons">
        <div v-for="pokemon in pokemons" :key="pokemon.name" class="card">
          <PokemonItem
            :name="pokemon.name"
            :image="pokemon.sprites.other.dream_world.front_default"
            :types="pokemon.types"
          />
        </div>
      </div>

      <h4 class="pokemon__count">Total: {{ total }}</h4>
    </div> -->
  </div>
</template>

<script>
import HeaderContainer from "./components/HeaderContainer.vue";
import PokemonsContainer from "./components/PokemonsContainer.vue";
// import PokemonItem from "./components/PokemonItem.vue";

export default {
  name: "App",

  components: {
    HeaderContainer,
    PokemonsContainer,
  },
};
</script>

<style src="./assets/css/app.css" />
