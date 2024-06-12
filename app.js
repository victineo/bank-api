require('dotenv').config(); // Run 'npm install dotenv' on project directory terminal
var express = require('express'); // Run 'npm install express' on project directory terminal
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose'); // Run 'npm install mongoose' on project directory terminal

const routerApiDocs = require('./routes/router_apidocs');

mongoose.connect(process.env.MONGODB_URL);

var usersRouter = require('./routes/router_users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/users', usersRouter);
app.use('/api-docs', routerApiDocs);

module.exports = app;