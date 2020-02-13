async function list (prisma) {
  return prisma.cliente.findMany()
}

async function save (prisma, { clienteInput, enderecoInput }) {
  console.log(clienteInput)
  console.log(enderecoInput)

  const enderecoInserido = await prisma.endereco.upsert({
    create: {
      ...enderecoInput
    },
    update: {
      ...enderecoInput
    },
    select: {
      id: true
    },
    where: {
      id: enderecoInput.id || ''
    }
  })

  const createOrUpdate = {
    ...clienteInput,
    endereco: {
      connect: {
        id: enderecoInserido.id
      }
    }
  }

  return prisma.cliente.upsert({
    create: createOrUpdate,
    update: createOrUpdate,
    include: {
      endereco: true
    },
    where: {
      id: clienteInput.id || ''
    }
  })
}

module.exports = {
  list,
  save
}
