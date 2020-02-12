function hello (nome) {
  console.log(nome)
  return 'Olá ' + (nome || 'Mundo') + '!'
}

module.exports = {
  hello
}
