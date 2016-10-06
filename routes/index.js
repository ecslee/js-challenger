var express = require('express');
var router = express.Router();

var Acorn = require('acorn');

router.get('/', function (req, res) {
    res.render('index', {
        name: 'Emily'
    });
});

router.all('/acorn', function (req, res, next) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    next();
});

router.get('/acorn', function (req, res, next) {
    var result;
    try {
        result = JSON.stringify(Acorn.parse(decodeURI(req.query.js)));
    } catch (e) {
        console.log('=== ERROR ===');
        result = '<div class="alert alert-warning">' + e.message + '</div>';
    }
    
    res.end(result);
});

router.get('/acorn/:jsstring', function (req, res) {
    console.log(req.params);
    res.json(req.params.jsstring);
});

module.exports = router;