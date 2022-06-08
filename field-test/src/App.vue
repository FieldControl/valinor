<template>
  <HeaderContainer />

  <h1>Pokemons</h1>

  <div v-for="pokemon in pokemons" :key="pokemon.name">
    <PokemonItem
      :name="pokemon.name"
      :image="pokemon.sprites.other.dream_world.front_default"
      :types="pokemon.types"
    />
  </div>
</template>

<script>
import HeaderContainer from "./components/HeaderContainer.vue";
import PokemonItem from "./components/PokemonItem.vue";

export default {
  name: "App",
  data() {
    return {
      pokemons: [],
      results: 0,
      prev: "",
      next: "",
      search: "",
    };
  },

  components: {
    HeaderContainer,
    PokemonItem,
  },

  async mounted() {
    await this.getPokemons();
  },

  watch: {},

  methods: {
    async getPokemons(url = "https://pokeapi.co/api/v2/pokemon") {
      const {
        data: { results, count, previous, next },
      } = await this.axios.get(url);

      this.results = count;
      this.prev = previous;
      this.next = next;

      results.forEach(async (result) => {
        const { data } = await this.axios.get(result.url);

        this.pokemons.push(data);
      });
    },
  },
};
</script>

<style src="./assets/css/app.css" />
