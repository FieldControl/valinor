async function list (prisma) {
  return prisma.produto.findMany()
}

async function save (prisma, produtoInput) {
  return prisma.produto.upsert({
    create: {
      ...produtoInput
    },
    update: {
      ...produtoInput
    },
    where: {
      id: produtoInput.id || ''
    }
  })
}

module.exports = {
  list,
  save
}
