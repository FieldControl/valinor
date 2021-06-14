<template>
  <div class="container">
    <section class="error-container">
      <h1>404</h1>
      <h2>Não há nada aqui!</h2>
      <p>A página que você está tentando acessar não existe.</p>
      <router-link
        v-wave
        :to="{ name: 'Home' }"
        class="btn-primary"
      >
        Voltar para a página inicial
      </router-link>
    </section>
  </div>
</template>

<style lang="scss" scoped>
  @import './style.scss';
</style>
