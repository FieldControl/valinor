import axios from 'axios'

// import { Toast } from './Toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_REST_URL,
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    let message = ''

    if (error.response.data instanceof Blob) {
      const fr = new FileReader()

      fr.addEventListener('load', () => {
        const errorJSON = JSON.parse(fr.result as string)
        console.error(`ERROR_REST: ${errorJSON.message}`)
        // Toast(errorJSON.message)
      })

      fr.readAsText(error.response.data)
    } else {
      if (
        typeof error.response === 'object' &&
        error.response &&
        error.response.data.message
      ) {
        message = error.response?.data?.message
          ? error.response?.data?.message.replace(/Error: /gi, '')
          : error.response?.data?.replace(/Error: /gi, '')
      } else {
        message = 'Ocorreu um erro indesperado ao executar a ação.'
      }

      console.error(`ERROR_REST: ${message}`)
      // Toast('teste' as string)
    }

    return Promise.reject(error.response)
  },
)

export default api
