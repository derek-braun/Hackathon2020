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
    res.redirect("/tasks");
});

app.get("/tasks", function (req, res){
    res.render("tasks");
});

app.get("/default", function (req, res){
    res.render("default");
});

//Create server, wait for requests
app.listen(8080, function(){
    console.log("Server Running on Port 8080");
});