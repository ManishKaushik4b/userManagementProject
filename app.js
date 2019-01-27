let express = require('express');
let app = express();
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let config = require('./config/app_config');
let authController = require('./app/routes/auth_controller');
let port = process.env.PORT || 3000;

mongoose.connect('mongodb://'+config.dbConfig.host+":"+config.dbConfig.port+'/'+config.dbConfig.dbName);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));               
app.use(bodyParser.text());                                    
app.use(bodyParser.json({ type: 'application/json'})); 

app.get("/", (req, res) => res.json({message: "Welcome!"}));
app.route("/register_user")
   .post(authController.register);

app.route("/update_user")
   .post(authController.updateUserDetails);

app.route("/login_user")
   .post(authController.login);

app.route("/delete_user")
   .get(authController.deletUser);

 
app.listen(port);
console.log("Listening on port " + port);

module.exports = app;