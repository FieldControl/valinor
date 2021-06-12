import Vue from 'vue';
import axios from 'axios';

axios.defaults.baseURL = `${process.env.VUE_APP_API_URL}/search/repositories`;
Vue.prototype.$axios = axios;
