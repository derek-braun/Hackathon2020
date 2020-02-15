var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var session = require('express-session');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

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