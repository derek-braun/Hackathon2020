var bodyParser = require('body-parser')
;
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
app.use('/root', express.static(__dirname + '/'));

// Requires request and request-promise for HTTP requests
// e.g. npm install request request-promise
const rp = require('request-promise');
// Requires fs to write synthesized speech to a file
const fs = require('fs');
// Requires readline-sync to read command line inputs
const readline = require('readline-sync');
// Requires xmlbuilder to build the SSML body
const xmlbuilder = require('xmlbuilder');

// Gets an access token.
function getAccessToken(subscriptionKey) {
    let options = {
        method: 'POST',
        uri: 'https://canadacentral.api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }
    return rp(options);
}

// Make sure to update User-Agent with the name of your resource.
// You can also change the voice and output formats. See:
// https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support#text-to-speech
function textToSpeech(accessToken, text) {
    // Create the SSML request.
    let xml_body = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', 'en-us')
        .ele('voice')
        .att('xml:lang', 'en-us')
        .att('name', 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)')
        .txt(text)
        .end();
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();

    let options = {
        method: 'POST',
        baseUrl: 'https://canadacentral.tts.speech.microsoft.com/',
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'Hackathon2020',
            'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    }

    let request = rp(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                request.pipe(fs.createWriteStream('TTSOutput.wav'));
                console.log('\nYour file is ready.\n')
            }
        });
    return request;
}

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

    app.get("/signup", function(req, res){
        res.render("signup");
    });

    app.post("/signup", function(req, res){
    });

    app.get("/patientDirectory", function(req, res){
        res.render("patientDirectory");
    });

    app.get("/reband", function(req, res){
        res.render("reband");
    });

    // Prevent internal page access without login
    app.use(function(req, res, next) {
        if(req.session && req.session.userId) {
            next();
        } else {
            res.redirect("/");
        }
    });

    app.get("/tasks", async function (req, res){
        res.render("tasks");
    });

    app.post("/tasks", async function(req, res){
        console.log(req.body.recording);
        const subscriptionKey = "0ad85ed05628469eb188c20579535bfe";
        if (!subscriptionKey) {
            throw new Error('Environment variable for your subscription key is not set.')
        };
        // Prompts the user to input text.
        const text = req.body.recording;

        try {
            const accessToken = await getAccessToken(subscriptionKey);
            await textToSpeech(accessToken, text);
        } catch (err) {
            console.log(`Something went wrong: ${err}`);
        }
        setTimeout(function() {
            return res.redirect("/tasks");
        }, 50);
    });

    app.get("/addTask", function (req, res){
        res.render("addTask");
    });

    //Create server, wait for requests
    app.listen(8080, function(){
        console.log("Server Running on Port 8080");
    });

});