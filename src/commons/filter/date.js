
class Date {
    format(value) {
      return value.substring(8,10) + '/' + value.substring(5,7) + '/' + value.substring(0, 4)
    }
}

export default new Date()
