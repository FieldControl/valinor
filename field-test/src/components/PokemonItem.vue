<template>
  <figure>
    <img :src="image" alt="Imagem do pokemon" />
  </figure>
  <h2>{{ name }}</h2>
  <div v-for="t in types" :key="t.slot">
    <span>{{ t.type.name }}</span>
  </div>
</template>

<script>
export default {
  name: "PokemonItem",

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
};
</script>

<style scoped src="../assets/css/pokemon.css" />