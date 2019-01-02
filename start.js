const app = require('./app');
app.set('port', 8888);

const server = app.listen(app.get('port'), () => {
    console.log(`Server running at ${server.address().port}`);
});