const { server } = require('../src/index')
const {
  INSERIR_FINALIZADORA,
  INSERIR_PRODUTO,
  INSERIR_CLIENTE,
  ABRIR_ATENDIMENTO,
  LANCAR_ITEM,
  LANCAR_PAGAMENTO,
  ALTERAR_STATUS,
  AUDITAR_EARQUIVAR
} = require('../src/utils/query')

const { createTestClient } = require('apollo-server-testing')

const { query, mutate } = createTestClient(server)

query({
  query: GET_USER,
  variables: { id: 1 }
})

mutate({
  mutation: UPDATE_USER,
  variables: { id: 1, email: 'nancy@foo.co' }
})

async function main () {
  const serverReady = await server

  describe('Array', function () {
    describe('#indexOf()', function () {
      it('should return -1 when the value is not present', function () {
        expect([1, 2]).toContain(1)
      })
    })
  })
}
