
const isProduction = (process.env.PROD || 'false') == 'true'

const appUrl = isProduction ? "https://gql-leo.herokuapp.com/" : "http://localhost:4000"



module.exports = {
    isProduction,
    appUrl
}