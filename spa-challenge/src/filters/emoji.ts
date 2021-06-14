import Vue from 'vue';
import emoji from 'node-emoji';

Vue.filter('$emoji', (text: string) => emoji.emojify(text));
