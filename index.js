const { get } = require("https")

const test = get('https://api.github.com/search/repositories?q=modulo04').on('data', (data) => {console.log(data)})