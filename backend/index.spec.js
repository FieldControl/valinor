const request = require('supertest')
const app = require('./index')
const db = require('./src/data/arquivo')

describe('Database test', () => {

   it('Should connect on Database', async () => {
      let result
      try {
         await db.query('SELECT schema_name FROM information_schema.schemata')
         result = true
      } catch (error) {
         result = false
      }
      
      expect(result).toBeTruthy()
   })
   
   it('Should verify ou create the database', async () => {
      const res = await request(app).get("/")
      expect(res.statusCode).toBe(200)
      let result
      result = await db.query("SELECT COUNT(*) FROM champions")
      
      if(result.rows[0].count != "162"){
         expect(res.body).toEqual('Database created')
      }else{
         expect(result.rows[0].count).toBe("162")
         expect(res.body).toEqual('Database already exists')
      }
   });

})

describe('Routing test', () => {
   it('Should send N champions based on pagination', async () => {
      const offset = 0
      const limit = 10
      const res = await request(app).get(`/${offset}/${limit}`)
      expect(res.body).toHaveLength(limit - offset)
   })
   
   it('Should send wanted champion', async () => {
      const getNames = await request(app).get(`/0/20`)
      for (let i = 0; i < 20; i++) {
         const name = getNames.body[i].name
         const res = await request(app).get(`/${name}`)
         expect(res.body[0].name).toEqual(name)
      }
   })
})