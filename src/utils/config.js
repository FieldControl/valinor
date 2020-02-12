
const isProduction = (process.env.PROD || 'false') == 'true'

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
  // mysql://tsv0j2hl5m7q14l2:y1uzfzvtvo7kuwhp@g3v9lgqa8h5nq05o.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/c572ymepzv3e1tq5
  // const connectionString = 'mysql://root:202cb962ac59075b964b07152d234b70@localhost:3306/gqltest?reconnect=true'

  console.log(connectionString)
  const url = 'mysql://' + connectionString.split('@')[1]
  const user = connectionString.split('://')[1].split(':')[0]
  const password = connectionString.split('://')[1].split(':')[1].split('@')[0]
  const host = connectionString.split('@')[1].split(':')[0]
  const database = connectionString.split('@')[1].split('/')[1].split('?')[0]
  const port = connectionString.split('@')[1].split(':')[1].split('/')[0]
  return {
    host,
    url,
    user,
    password,
    database,
    port
  }
}
