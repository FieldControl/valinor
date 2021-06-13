import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './filters/capitalize';
import './filters/numberFormat';
import './plugins/vwave';
import './plugins/axios';
import './styles/template.scss';

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
