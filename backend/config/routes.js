const express = require('express')
const axios = require('axios')
const routes = express.Router()
const db = require('../src/data/arquivo')


//Conditional if Database has been created
async function countTable() {
   try {
      await db.query('Select * From champions')
   } catch (error) {
      await db.query(`CREATE TABLE Champions(
         id serial NOT NULL PRIMARY KEY,
         name varchar NOT NULL,
         title varchar NOT NULL,
         tags varchar[] NOT NULL,
         passiveImage varchar NOT NULL,
         passiveName varchar NOT NULL,
         passiveDescription varchar NOT NULL,
         spellsID varchar[] NOT NULL,
         spellsName varchar[] NOT NULL,
         spellsDescription varchar[] NOT NULL,
         lore varchar NOT NULL,
         skins varchar[],
         skinsName varchar[]
         )`)
   }


   let result
   result = await db.query("SELECT COUNT(*) FROM champions")

   return result.rows[0].count
}
//Create Database
routes.get('/', (req, response) => {
   getChampion()
   async function getChampion() {
      const championListFull = await axios.get('http://ddragon.leagueoflegends.com/cdn/13.3.1/data/pt_BR/champion.json')
         .then(res => {
            return res.data
         })
      let champList = Object.values(championListFull.data)
      let dataChampions = await countTable()
      if (dataChampions !== '162') {
         createTable(champList)
         response.json('Database created')
      } else {
         response.json('Database already exists')
      }
   }
})

async function createTable(listChampions) {
   const query = "INSERT INTO champions (name,title,tags,passiveImage,passiveName,passiveDescription,spellsID,spellsName,spellsDescription,lore) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)"

   for (let i = 0; i < listChampions.length; i++) {
      let name = listChampions[i].id
      await getChampionDetails(name)
   }

   async function getChampionDetails(n) {
      const championListFull = await axios.get(`http://ddragon.leagueoflegends.com/cdn/13.3.1/data/en_US/champion/${n}.json`)
         .then(res => {
            return res.data
         })
      let champList = Object.values(championListFull.data)

      let champ = champList[0]

      await db.query(query,
         [`${champ.id}`, `${champ.title}`,
         [champ.tags[0], champ.tags[1]], `${champ.passive.image.full}`,
         `${champ.passive.name}`, `${champ.passive.description}`,
         [champ.spells[0].id, champ.spells[1].id, champ.spells[2].id,
         champ.spells[3].id], [champ.spells[0].name, champ.spells[1].name,
         champ.spells[2].name, champ.spells[3].name],
         [champ.spells[0].description, champ.spells[1].description,
         champ.spells[2].description, champ.spells[3].description],
         `${champ.lore}`]).then(getSkins())


      async function getSkins() {

         for (let index = 0; index < champ.skins.length; index++) {
            await db.query(`UPDATE champions SET skins[${index}] = '${champ.skins[index].num}' WHERE name = '${champ.id}'`)
            //Some names come with ' like Battle Boss Bel'Veth
            let skinName = champ.skins[index].name.replace(/'/g, '')
            await db.query(`UPDATE champions SET skinsName[${index}] = '${skinName}' WHERE name = '${champ.id}'`)
         }
      }
   }
}

//Search Champions
routes.get('/:name', (req, response) => {
   const name = req.params.name

   searchTable(name).then(rows => {
      response.send(rows)
   })

})
async function searchTable(name) {
   result = await db.query(`SELECT name,title,tags,passiveImage,passiveName,passiveDescription,
   spellsID,spellsName,spellsDescription,lore,skins,skinsName FROM champions WHERE name LIKE '${name}%'`)

   return result.rows
}

//Paginator
routes.get('/:offset/:limit', (req, response) => {
   const offset = req.params.offset
   const limit = req.params.limit

   paginatorTable(offset, limit).then(rows => {
      response.send(rows)
   })

})
async function paginatorTable(id1, id2) {
   let result
   result = await db.query(`SELECT name,tags,skins,skinsName FROM champions WHERE id BETWEEN ${id1} AND ${id2}`)

   return result.rows
}

module.exports = routes