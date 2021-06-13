import Vue from 'vue';

Vue.filter('$numberFormat', (value: number) => {
  const number = new Intl.NumberFormat('pt-BR').format(value);
  return number;
});
