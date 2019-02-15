//The require() method is used to load and cache JavaScript modules.
// So, if you want to load a local, relative JavaScript module into a Node.js application, you can simply use the require() method.
var uri = 'mongodb+srv://admin:admin@tmcluster-1frve.mongodb.net/test?retryWrites=true';

//all the modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');

require('./config/passport')(passport);

// When you call mongoose.connect, it will set up a connection with the database.

//Connect to the database
mongoose.connect(uri, { useNewUrlParser: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const app = express();

//static files
app.use(express.static(path.join(__dirname, 'public')));

// set the view engine to ejs
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

//bodyParser used for req.body
app.use(express.urlencoded({extended: false}));

// server
const server = require("http").Server(app);
server.listen(3000);

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));



// Express Session Middleware
app.use(
    session({
      secret: 'keyboard cat',
      resave: true,
      saveUninitialized: true
    })
);


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  //flash for passport
  res.locals.error = req.flash('error');
  next();
});


//Route Files
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


