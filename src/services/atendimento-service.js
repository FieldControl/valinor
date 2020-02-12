const { Status } = require('@prisma/client')

const ATENDIMENTO_ALL_FIELDS = {
  cliente: true,
  enderecoEntrega: true,
  pagamentos: {
    include: {
      finalizadora: true
    }
  },
  itens: {
    include: {
      produto: true
    }
  }
}

async function list (prisma, { skip, first }) {
  slip = skip || 0
  first = first || 24
  return prisma.atendimento.findMany({ include: ATENDIMENTO_ALL_FIELDS })
}

async function find (prisma, id) {
  if ((typeof id !== 'string') || id == '') {
    throw new Error('invalid id: ' + id)
  }

  const atendimento = await prisma.atendimento.findOne({
    where: {
      id: id
    },
    include: ATENDIMENTO_ALL_FIELDS
  })

  if (!atendimento) {
    throw new Error('Atendimento [Id ' + id + ' não encontrado]')
  }

  console.log(atendimento)
  return atendimento
}

async function alterarStatus (prisma, { idAtendimento, status }) {
  return await prisma.atendimento.update({
    data: {
      status: status
    },
    where: {
      id: idAtendimento
    }
  })
}

async function lancarItem (prisma, { idAtendimento, itemInput }) {
  const produto = await prisma.produto.findOne({
    where: {
      id: itemInput.idProduto
    }
  })

  if (!produto) {
    throw new Error('Produto [Id ' + itemInput.idProduto + '] não encontrado')
  }

  const atendimento = await prisma.atendimento.findOne({
    where: {
      id: idAtendimento
    }
  })

  if (!atendimento) {
    throw new Error('Atendimento [Id ' + idAtendimento + '] não encontrado')
  }

  if (atendimento.status !== Status.ABERTO) {
    throw new Error('Atendimento [Id ' + idAtendimento + '] não está aberto')
  }

  if (itemInput.id) {
    const item = await prisma.item.findOne({
      where: {
        id: itemInput.id
      },
      include: {
        atendimento: {
          select: {
            id: true
          }
        }
      }
    })

    if (item && (item.atendimento.id !== idAtendimento)) {
      throw new Error('Item [Id ' + itemInput.id + '] não pertence ao atendimento [Id ' + idAtendimento + ']')
    }
  }

  const item = {
    id: itemInput.id,
    descricao: produto.descricao,
    cancelado: itemInput.cancelado || false,
    quantidade: itemInput.quantidade,
    precoUnitario: produto.preco,
    valor: itemInput.quantidade * produto.preco
  }

  await prisma.item.upsert({
    create: {
      ...item,
      produto: {
        connect: {
          id: produto.id
        }
      },
      atendimento: {
        connect: {
          id: idAtendimento
        }
      }
    },
    update: {
      ...item,
      produto: {
        connect: {
          id: produto.id
        }
      },
      atendimento: {
        connect: {
          id: idAtendimento
        }
      }
    },
    where: {
      id: item.id || ''
    }
  })

  const atendimentoComItens = await prisma.atendimento.findOne({
    where: {
      id: idAtendimento
    },
    include: {
      itens: {
        select: {
          cancelado: true,
          valor: true
        }
      }
    }
  })

  // todo validar se o item veio de outro atendimento

  const itens = atendimentoComItens.itens

  const valorPedido = itens.filter(item => !item.cancelado)
    .map(item => item.valor)
    .reduce((soma, valorAtual) => {
      return soma += valorAtual
    }, 0)

  const atendimentoAtualizado = await prisma.atendimento.update({
    where: {
      id: idAtendimento
    },
    data: {
      valorTotal: valorPedido + atendimentoComItens.valorEntrega,
      valorPedido: valorPedido
    },
    include: {
      cliente: true,
      enderecoEntrega: true,
      pagamentos: {
        include: {
          finalizadora: true
        }
      },
      itens: {
        include: {
          produto: true
        }
      }
    }
  })

  return atendimentoAtualizado
}

async function abrirAtendimento (prisma, atendimentoInput) {
  const idCliente = atendimentoInput.idCliente || null
  delete atendimentoInput.idCliente

  const enderecoEntrega = atendimentoInput.enderecoEntrega || null
  delete atendimentoInput.enderecoEntrega

  const atendimento = atendimentoInput

  atendimento.dataAbertura = atendimento.dataAbertura || new Date().toISOString()

  if (idCliente && enderecoEntrega) { // cliente  e endereco informado ?
    const enderecoEntregaInserido = await prisma.endereco.upsert({
      create: {
        ...enderecoEntrega
      },
      update: {
        ...enderecoEntrega
      },
      where: {
        id: enderecoEntrega.id || ''
      },
      select: {
        id: true
      }

    })

    const createOrUpdate = {
      ...atendimento,
      cliente: {
        connect: {
          id: idCliente
        }
      },
      enderecoEntrega: {
        connect: {
          id: enderecoEntregaInserido.id
        }
      }
    }

    return await prisma.atendimento.upsert({
      create: {
        ...createOrUpdate,
        valorEntrega: 10 * Math.random()
      },
      update: createOrUpdate,
      where: {
        id: atendimentoInput.id || ''
      },
      include: {
        cliente: true,
        enderecoEntrega: true
      }
    })
  } else if (idCliente) { // somente cliente
    const cliente = await prisma.cliente.findOne({
      where: {
        id: idCliente
      },
      select: {
        endereco: {
          select: {
            id: true
          }
        }
      }
    })

    if (!cliente) {
      throw new Error('cliente [Id ' + idCliente + '] não encontrado')
    }

    const createOrUpdate = {
      ...atendimento,
      cliente: {
        connect: {
          id: idCliente
        }
      },
      enderecoEntrega: {
        connect: {
          id: cliente.endereco.id
        }
      }
    }

    return await prisma.atendimento.upsert({
      create: {
        ...createOrUpdate,
        valorEntrega: parseFloat((10 * Math.random()).toFixed(2))
      },
      update: createOrUpdate,
      where: {
        id: atendimentoInput.id || ''
      },
      include: {
        cliente: true,
        enderecoEntrega: true
      }
    })
  } else if (enderecoEntrega) { // somente endereco
    const enderecoEntregaInserido = await prisma.endereco.upsert({
      create: {
        ...enderecoEntrega
      },
      update: {
        ...enderecoEntrega
      },
      where: {
        id: enderecoEntrega.id || ''
      },
      select: {
        id: true
      }

    })

    const createOrUpdate = {
      ...atendimento,
      enderecoEntrega: {
        connect: {
          id: enderecoEntregaInserido.id
        }
      }
    }

    return await prisma.atendimento.create({
      create: {
        ...createOrUpdate,
        valorEntrega: parseFloat((10 * Math.random()).toFixed(2))
      },
      update: createOrUpdate,
      where: {
        id: atendimentoInput.id || ''
      },
      include: {
        cliente: true,
        enderecoEntrega: true
      }
    })
  } else {
    return await prisma.atendimento.upsert({
      create: {
        ...atendimento,
        valorEntrega: parseFloat((10 * Math.random()).toFixed(2))
      },
      update: {
        ...atendimento
      },
      where: {
        id: atendimentoInput.id || ''
      },
      include: {
        cliente: true,
        enderecoEntrega: true
      }
    })
  }
}

async function lancarPagamento (prisma, { idAtendimento, pagamentoInput }) {
  const idFinalizadora = pagamentoInput.idFinalizadora
  delete pagamentoInput.idFinalizadora
  pagamentoInput.troco = pagamentoInput.troco || 0

  const atendimento = await prisma.atendimento.findOne({
    where: {
      id: idAtendimento
    }
  })

  if (!atendimento) {
    throw new Error('Atendimento [Id ' + idAtendimento + '] não encontrado')
  }

  const finalizadora = await prisma.finalizadora.findOne({
    where: {
      id: idFinalizadora
    },
    select: {
      id: true
    }
  })

  if (!finalizadora) {
    throw new Error('Finalizadora [Id ' + idFinalizadora + '] não encontrada')
  }

  if (pagamentoInput.id) {
    const pagamento = await prisma.pagamento.findOne({
      where: {
        id: pagamentoInput.id
      },
      include: {
        atendimento: {
          select: {
            id: true
          }
        }
      }
    })

    if (pagamento && (pagamento.atendimento.id != idAtendimento)) {
      throw new Error('Pagamento [Id ' + pagamentoInput.id + '] não pertence ao atendimento [Id ' + idAtendimento + ']')
    }
  }

  const valorEsperado = atendimento.valorTotal - atendimento.valorPago
  const valorPagamento = pagamentoInput.valor - pagamentoInput.troco

  if (valorPagamento > valorEsperado) {
    throw new Error('Pagamento inválido, valor informado [' + valorPagamento + '] esperado [' + valorEsperado + ']')
  }

  await prisma.pagamento.upsert({
    create: {
      ...pagamentoInput,
      finalizadora: {
        connect: {
          id: idFinalizadora
        }
      },
      atendimento: {
        connect: {
          id: idAtendimento
        }
      }
    },
    update: {
      ...pagamentoInput,
      finalizadora: {
        connect: {
          id: idFinalizadora
        }
      },
      atendimento: {
        connect: {
          id: idAtendimento
        }
      }
    },
    where: {
      id: pagamentoInput.id || ''
    }
  })

  const atendimentoComPagamentos = await prisma.atendimento.findOne({
    where: {
      id: idAtendimento
    },
    include: {
      pagamentos: {
        select: {
          cancelado: true,
          valor: true,
          troco: true
        }
      }
    }
  })

  const valorPago = atendimentoComPagamentos.pagamentos
    .filter(pagamento => !pagamento.cancelado)
    .map(pagamento => pagamento.valor - pagamento.troco)
    .reduce((soma, valorAtual) => {
      return soma += valorAtual
    }, 0)

  const data = {
    valorPago: valorPago
  }

  if (valorPago == atendimentoComPagamentos.valorTotal) {
    data.status = Status.RECEBIDO
  }

  return await prisma.atendimento.update({
    where: {
      id: idAtendimento
    },
    data: data,
    include: {
      cliente: true,
      enderecoEntrega: true,
      pagamentos: {
        include: {
          finalizadora: true
        }
      },
      itens: {
        include: {
          produto: true
        }
      }
    }
  })
}

async function arquivar (prisma, idAtendimento) {
  return await prisma.atendimento.update({
    where: {
      id: idAtendimento
    },
    data: {
      arquivado: true
    }
  })
}

async function auditar (prisma, atendimento) {
  if (atendimento.status == Status.CANCELADO) {
    return
  }

  const erros = []

  const valorTotal = atendimento.valorPedido + atendimento.valorEntrega

  if (valorTotal != atendimento.valorTotal) {
    erros.push({
      entidade: 'atendimento',
      id: atendimento.id,
      descricao: 'valor total do atendimento incorreto',
      valorEsperado: valorTotal,
      valorObtido: atendimento.valorTotal
    })
  }

  if (valorTotal != atendimento.valorPago) {
    erros.push({
      entidade: 'atendimento',
      id: atendimento.id,
      descricao: 'valor pago do atendimento incorreto',
      valorEsperado: valorTotal,
      valorObtido: atendimento.valorPago
    })
  }

  const somaValorItem = atendimento.itens
    .filter(item => !item.cancelado)
    .map(item => {
      const multiply = item.quantidade * item.precoUnitario
      if (multiply != item.valor) {
        erros.push({
          entidade: 'item',
          id: item.id,
          descricao: 'valor do item incorreto',
          valorEsperado: multiply,
          valorObtido: item.valor
        })
      }
      return multiply
    }).reduce((soma, atual) => {
      return soma += atual
    }, 0)

  if (somaValorItem != atendimento.valorPedido) {
    erros.push({
      entidade: 'atendimento',
      id: atendimento.id,
      descricao: 'valor do atendimento difere do valor do item',
      valorEsperado: multiply,
      valorObtido: item.valor
    })
  }

  const somaValorPagamento = atendimento.pagamentos
    .filter(pagamento => !pagamento.cancelado)
    .map(pagamento => {
      console.log(pagamento)
      const multiply = pagamento.valor - pagamento.troco
      return multiply
    }).reduce((soma, atual) => {
      console.log(soma)
      console.log(atual)
      return soma += atual
    }, 0)

  if (somaValorPagamento != atendimento.valorPago) {
    console.log('teste')
    console.log(somaValorPagamento)
    console.log(atendimento.valorPago)

    erros.push({
      entidade: 'atendimento',
      id: atendimento.id,
      descricao: 'valor do atendimento difere do valor do pagamento',
      valorEsperado: somaValorPagamento,
      valorObtido: atendimento.valorPago
    })
  }

  if (erros.length != 0) {
    throw new Error(JSON.stringify(erros))
  }
}

async function auditarEArquivar (prisma, idAtendimento) {
  const atendimento = await find(prisma, idAtendimento)

  if (atendimento.arquivado) {
    throw new Error('Atendimento [Id ' + idAtendimento + '] já arquivado')
  }

  await auditar(prisma, atendimento)

  await arquivar(prisma, idAtendimento)

  atendimento.arquivado = true

  return atendimento
}

module.exports = {
  list,
  find,
  abrirAtendimento,
  alterarStatus,
  lancarItem,
  lancarPagamento,
  auditarEArquivar
}
