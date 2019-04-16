//Main Function that runs after a connection.query
function QueryResult(res, error, results)
{
    if(error)
    {
        res.sendStatus(500)
        console.log(error)
    }     
    res.json(results)
}

module.exports = QueryResult
