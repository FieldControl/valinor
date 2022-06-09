<template>
  <HeaderContainer />

  <div class="container">
    <h1 class="page-title">Pokemons</h1>

    <div class="section">
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
    </div>
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
      total: 0,
      offset: 0,
      limit: 21,
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
    async getPokemons() {
      const {
        data: { results, count, previous, next },
      } = await this.axios.get(
        `https://pokeapi.co/api/v2/pokemon?offset=${this.offset}&limit=${this.limit}`
      );

      if (this.total !== count) {
        this.total = count;
      }

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
