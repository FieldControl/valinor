let eventCounter = 0
global.document = {
    getElementById: () => ({addEventListener: ()=>eventCounter++, innerHTML: ''}) 
}
const { before, beforeEach } = require('node:test')
const { getData } = require('./index')

describe('Unit testes', () => {
    let itsOk
    let code
    let error
    let total_count
    let expectError        
    const catchSpy = jest.spyOn(Promise.prototype, 'catch')
    const setFetch = (itsOk, code, total_count) => {
        global.fetch = jest.fn().mockResolvedValue({
        ok: itsOk,
        status: code,
        json: () => ({
            total_count: total_count,
            items: [],
        }),
        })
    }

    it('Force request error', async () => {
        itsOk = false
        code = "404"
        error = ''
        total_count = 1
        expectError = code
        setFetch(itsOk, code, total_count)

        await new Promise((resolve) => resolve()).then(() => getData('', 1))
        
        try{
            await catchSpy.mock.contexts.at(-1)
        }catch(err){
            error = err.message
        }

        expect(error).toBe(expectError)
    })

    it('Not found repository', async () => {
        itsOk = true
        code = "200"
        error = ''
        total_count = 0
        expectError = 'Not found '
        setFetch(itsOk, code, total_count)

        await new Promise((resolve) => resolve()).then(() => getData('', 1))
        try{
            await catchSpy.mock.contexts.at(-1)
        }catch(err){
            error = err.message
        }
        expect(error).toBe(expectError)
    })
})
