<template>
  <div class="section">
    <div class="navigation-container">
      <select class="per-page" v-model.number="perPage">
        <option v-for="v in select" :key="v">
          {{ v }}
        </option>
      </select>

      <div class="prev-next">
        <button
          type="button"
          class="button prev-button"
          v-if="prev"
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
  </div>
</template>

<script>
import PokemonItem from "./PokemonItem.vue";

export default {
  name: "PokemonsContainer",

  components: {
    PokemonItem,
  },

  data() {
    return {
      pokemons: [],
      total: 0,
      prev: false,
      next: false,
      perPage: 30,
      offset: 0,
      limit: 30,
      select: [30, 60, 90, 120],
    };
  },

  mounted() {
    this.getPokemons();
  },

  watch: {
    perPage: function () {
      this.limit = this.perPage;

      this.getPokemons();
    },
  },

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

      this.prev = previous !== null;
      this.next = next !== null;

      if (this.pokemons.length > 0) {
        this.pokemons = [];
      }

      results.forEach(async (result) => {
        const { data } = await this.axios.get(result.url);

        this.pokemons.push(data);
      });
    },

    nextPokemons() {
      this.offset = this.limit;
      this.limit += this.perPage;

      this.getPokemons();
    },

    prevPokemons() {
      this.offset =
        this.offset !== this.perPage + 1 ? this.offset - this.perPage : 0;
      this.limit -= this.perPage;

      this.getPokemons();
    },
  },
};
</script>

<style scoped src="../assets/css/pokemons.css" />