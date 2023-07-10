
class number {
  format(value) {
    let formattedNumber
    let options = { minimumFractionDigits: 1, maximumFractionDigits: 1 }

    if (value >= 1000) {
      formattedNumber = (value / 1000).toLocaleString('pt-BR', options) + 'k'
    } else {
      formattedNumber = value
    }

    return formattedNumber
  }
}

export default new number()
