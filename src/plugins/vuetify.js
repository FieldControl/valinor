import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import {VDataTable, VDataTableServer} from 'vuetify/labs/components'

export default createVuetify({
  components: {
    VDataTable, VDataTableServer
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#EDF0F3',
          secondary: '#F6F8FA',
        },
      },
    },
  },
})
