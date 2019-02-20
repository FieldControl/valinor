const app = require('../src/app')
const port = normalizaPorta(process.env.port || '3000')

function normalizaPorta (val) {
  const port = parseInt(val, 10)
  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}
app.listen(port, function () {
  console.log('O aplicativo está na porta ' + port)
})
