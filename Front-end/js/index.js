import { button } from '../js/elements.js';
import getRepo from './getRepository.js';

button.addEventListener('click', () => {
    getRepo()
});


