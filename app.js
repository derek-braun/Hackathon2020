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
mongoose.connect(mongoUrl, { useNewUrlParser: true })

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to MongoDB'))

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

app.post("/login", function(req, res){
   //Do query stuff here
   //If valid user set req.session.userId = username
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