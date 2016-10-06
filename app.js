var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var acorn = require('acorn');
var index = require('./routes/index');

var hostname = 'localhost';
var port = 3000;

// setup app server
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', index);

app.listen(port, hostname, function () {
    console.log(`Server running at http://${hostname}:${port}/`);
});

module.exports = app;