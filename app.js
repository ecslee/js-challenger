var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var hostname = 'localhost';
var port = 3000;

// setup app server
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var index = require('./routes/index');
app.use('/', index);

var acorn = require('./routes/acorn');
app.use('/acorn', acorn);

app.listen(port, hostname, function () {
    console.log(`Server running at http://${hostname}:${port}/`);
});

module.exports = app;