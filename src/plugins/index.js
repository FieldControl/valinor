import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import pinia from '../commons/store'
import router from '../router'

export function registerPlugins (app) {
  loadFonts()
  app
    .use(vuetify)
    .use(pinia)
    .use(router)
}
