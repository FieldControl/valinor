import {shallowMount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import {createPinia} from 'pinia'


let vuetify = createVuetify()
let pinia = createPinia()


export function mountWithPinia(component, options = {}, globalOptions = {}) {
  return shallowMount(component, {
    global: {
      plugins: [vuetify, pinia],
      ...globalOptions
    },
    ...options,
  })
}
