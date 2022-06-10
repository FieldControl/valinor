import * as Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import VueAxios from "vue-axios";

const app = Vue.createApp(App);
app.use(VueAxios, axios);

app.mount("#app");
