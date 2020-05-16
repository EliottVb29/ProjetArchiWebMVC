//call express
let express = require('express');

//app va use express
let app = express();

//appel db
let sql = require('./db.js');

//Import les routes
let router = require('./routes');

//Pour les POST requests
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//Permet de use le css
app.use(express.static('public'));

//Définition des routes vers serveur
app.use('/', router);

//Vérification port
let port = process.env.PORT || 8082;
app.listen(port, function () {
    console.log("Server running on port " + port);
});


