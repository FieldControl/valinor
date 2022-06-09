<template>
  <figure class="image-figure">
    <img :src="image" alt="Imagem do pokemon" class="image" />
  </figure>
  <h2 class="title">{{ name }}</h2>
  <div class="types">
    <span
      v-for="t in types"
      :key="t.slot"
      class="type"
      :style="`background-color: ${colors[t.type.name]}`"
    >
      {{ t.type.name }}
    </span>
  </div>
</template>

<script>
export default {
  name: "PokemonItem",

  data() {
    return {
      colors: {},
    };
  },

  props: {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    types: {
      type: Array,
      required: true,
    },
  },

  mounted() {
    this.colors = {
      normal: "#A8A77A",
      fire: "#EE8130",
      water: "#6390F0",
      electric: "#F7D02C",
      grass: "#7AC74C",
      ice: "#96D9D6",
      fighting: "#C22E28",
      poison: "#A33EA1",
      ground: "#E2BF65",
      flying: "#A98FF3",
      psychic: "#F95587",
      bug: "#A6B91A",
      rock: "#B6A136",
      ghost: "#735797",
      dragon: "#6F35FC",
      dark: "#705746",
      steel: "#B7B7CE",
      fairy: "#D685AD",
    };
  },
};
</script>

<style scoped src="../assets/css/pokemon.css" />