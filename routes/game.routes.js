module.exports = (app) => {
    const games = require('../controller/game.controller.js');

    /**
     * @swagger
     * definitions:
     *   Game:
     *     properties:
     *       title:
     *         type: string
     *       description:
     *         type: string
     *       score:
     *         type: integer
     *       company:
     *         type: string
     */


    /**
     * @swagger
     *
     * /games:
     *  post:
     *      tags:
     *          - Games
     *      summary: Add a new game into the database
     *      produces:
     *          - application/json
     *      parameters:
     *          - name: game
     *            description: Game object
     *            in: body
     *            required: true
     *            schema:
     *              $ref: '#/definitions/Game'
     *      responses:
     *          200:
     *              description: Success            
     */
    app.post('/games', games.create);

    /**
     * @swagger
     *
     * /games:
     *  get:
     *      summary: Return all the games in the database
     *      tags:
     *          - Games
     *      responses:
     *          '200':
     *              description: |-
     *                  200 Response
     *              content:
     *                  application/json:
     *                      examples:
     *                          foo:
     *                              value:
     *                                  {
     *                                      "_id": "5cbfcd92e3ed9175d7c58ab1",
     *                                      "title": "The Last of Us",
     *                                      "description": "Twenty years after a pandemic radically transformed known civilization, infected humans run amuck and survivors kill one another for sustenance and weapons - literally whatever they can get their hands on. Joel, a salty survivor, is hired to smuggle a fourteen-year-old girl, Ellie, out of a rough military quarantine, but what begins as a simple job quickly turns into a brutal journey across the country.",
     *                                      "score": 95,
     *                                      "company": "Naughty Dog",
     *                                      "createdAt": "2019-04-24T02:44:34.320Z",
     *                                      "updatedAt": "2019-04-24T02:46:27.122Z",
     *                                      "__v": 0
     *                                  }
     *          '500':
     *              description: |-
     *                  500 Response
     *              content:
     *                  application/json:
     *                      examples:
     *                          
     */
    app.get('/games', games.findAll);
    
    /**
     * @swagger
     *
     * /games/{id}:
     *  get:
     *      tags:
     *          - Games
     *      summary: Returns a single game
     *      produces:
     *          - application/json
     *      parameters:
     *          - name: id
     *            description: Game ID
     *            in: path
     *            required: true
     *            type: string
     *      responses:
     *          200:
     *              description: The game with the specified ID
     *              schema:
     *                  $ref: '#/definitions/Game'
     */
    app.get('/games/:gameId', games.findOne);

    
    /**
     * @swagger
     *
     * /games:
     *  put:
     *      tags:
     *          - Games
     *      summary: Update a game
     *      produces:
     *          - application/json
     *      parameters:
     *          - name: game
     *            description: Game object
     *            in: body
     *            required: true
     *            schema:
     *              $ref: '#/definitions/Game'
     *      responses:
     *          200:
     *              description: Success            
     */
    app.put('/games/:gameId', games.update);

    /**
     * @swagger
     *
     * /games/{id}:
     *  delete:
     *      tags:
     *          - Games
     *      summary: Delete a game from the database
     *      produces:
     *          - application/json
     *      parameters:
     *          - name: id
     *            description: Game ID
     *            in: path
     *            required: true
     *            type: string
     *      responses:
     *          200:
     *              description: Success
     */
    app.delete('/games/:gameId', games.delete);
}
