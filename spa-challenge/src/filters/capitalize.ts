import Vue from 'vue';

Vue.filter('$capitalize', (text: string) => text[0].toUpperCase() + text.substr(1));
