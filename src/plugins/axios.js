import axios from 'axios'

const instance = axios.create()

instance.interceptors.response.use(
  response => { return response },
  error => {
    if (
      error.request.responseType === 'blob' &&
      error.response.data instanceof Blob &&
      error.response.data.type?.toLowerCase().indexOf('json') !== -1
    ) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          error.response.data = JSON.parse(reader.result)
          resolve(Promise.reject(error))
        }

        reader.onerror = () => {
          reject(error)
        }

        reader.readAsText(error.response.data)
      })
    }

    return Promise.reject(error)
  }
)

export default instance
