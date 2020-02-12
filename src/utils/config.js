
// const isProduction = (process.env.PROD || 'false') == 'true'
const isProduction = true

const appUrl = isProduction ? 'https://gql-leo.herokuapp.com/' : 'http://localhost:4000'

module.exports = {
  isProduction,
  appUrl,
  databaseCredentials: {
    ...credentialsFromEnv()
  }
}

function credentialsFromEnv () {
  // exemple url mysql://user:pass@host:port/database?reconnect=true
  const connectionString = process.env.GQL_DATABASE_URL

  const url = 'mysql://' + connectionString.split('@')[1]
  const user = connectionString.split('://')[1].split(':')[0]
  const password = connectionString.split('://')[1].split(':')[1].split('@')[0]
  const host = connectionString.split('@')[1].split(':')[0]
  const database = connectionString.split('@')[1].split('/')[1].split('?')[0]
  return {
    host,
    url,
    user,
    password,
    database
  }
}
