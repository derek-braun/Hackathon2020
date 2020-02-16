var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var express = require('express');
var mongoose = require('mongoose');
var session = require('express-session');

// Setup .env config
dotenv.config()

// Setup express app
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use('/img', express.static(__dirname + '/Images'));


// Connect to MongoDB using Mongoose
var mongoUrl = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DB}`
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', (err) => console.error(err))
db.once('open', () => {
    console.log('Connected to MongoDB');

    // Setup models
    const models = require('./models')(db);

    // START TODO: Remove for prod
    // Reset contents in database
    db.db.dropDatabase(
        console.log(`${db.db.databaseName} database dropped.`)
    );

    new models.User({username: 'admin', password: 'admin'}).save().then(() => console.log("\nCreated Admin user\nUsername: admin\nPassword: admin"));
    // END TODO: Remove for prod

    //use sessions for tracking logins
    app.use(session({
        secret: 'Jordon Bad',
        resave: true,
        saveUninitialized: false
    }));

    //Redirect main page to login
    app.get("/", function (req, res){
        //redirect to login
        res.redirect("/login");
    });

    app.get("/login", function (req, res){
        res.render("login");
    });

    app.post("/login", function(req, res) {
        models.User.find({ username: req.body.username }, (err, users) => {
            if(err) {
                res.status(500).send({
                    message: 'Internal server error'
                });
            };

            if(users.length != 1) {
                res.status(404).send({
                    message: 'Invalid username or password'
                });
            };

            user = users[0];
            if(user.password == req.body.password) {
                req.session.userId = user.username;
                res.redirect('/tasks');
            } else {
                res.status(404).send({
                    message: 'Invalid username or password'
                });
            };
        });
        req.body.username 
    });

    // Prevent internal page access without login
    app.use(function(req, res, next) {
        if(req.session && req.session.userId) {
            next();
        } else {
            res.redirect("/");
        }
    });

    app.get("/tasks", function (req, res){
        res.render("tasks");
    });

    app.get("/addTask", function (req, res){
        res.render("addTask");
    });

    //Create server, wait for requests
    app.listen(8080, function(){
        console.log("Server Running on Port 8080");
    });
});