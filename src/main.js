import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import './assets/css/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './routes'
import { createPinia } from 'pinia';

createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')
