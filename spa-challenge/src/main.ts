import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './plugins/v-wave';
import './plugins/axios';
import './styles/template.scss';

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
