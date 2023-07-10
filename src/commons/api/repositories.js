import axios from '@/plugins/axios'

class RepositoriesApiClient {
  async findAll(payload, query) {
    console.log(payload)

    const {data: response} = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: query,
        page: payload.page,
        per_page: payload.per_page
      }
    })
    return response
  }
}


export default new RepositoriesApiClient()
