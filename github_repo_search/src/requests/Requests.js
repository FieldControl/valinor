//lib para realizar requests do próprio github
import { Octokit } from '@octokit/core'

//aqui deve ser setado a acces_key da conta
const access_key = "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"

const octokit = new Octokit({
    auth: access_key
  })
  
  //busca de repositorios
  export const getRepositories = async (qString , sort, order, page, per_page)=>{
     const result = await octokit.request(`GET /search/repositories?q=${qString}`, {
         sort: sort || "best-match",
         order: order || "desc",
         per_page: per_page || 10,
        page: page,
     })

     return result.data
  }

  //busca de descrição de tópico
  export const getTopicDescription = async (qString, page, per_page)=>{
     const result = await octokit.request(`GET /search/topics?q=${qString}`, {
         page: page || 1,
         per_page: per_page || 1,
     })

     return result.data
  }
